import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import Subscriber from '../models/Subscriber.js';
import Sequence from '../models/Sequence.js';
import Broadcast from '../models/Broadcast.js';
import User from '../models/User.js';
import { sendSequenceEmail, sendBroadcast } from '../services/emailService.js';

// Lazy initialization - only create connection when actually starting the processor
let connection = null;
let sequenceQueue = null;
let broadcastQueue = null;
let sequenceWorker = null;
let broadcastWorker = null;
let initialized = false;

/**
 * Initialize Redis connection and queues
 */
async function initialize() {
    if (initialized) return true;

    try {
        connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: null,
            retryStrategy: (times) => {
                // Don't retry, just fail immediately
                return null;
            }
        });

        // Wait for connection or error
        await new Promise((resolve, reject) => {
            connection.once('connect', resolve);
            connection.once('error', reject);
            setTimeout(() => reject(new Error('Redis connection timeout')), 3000);
        });

        // Create queues
        sequenceQueue = new Queue('sequence-emails', { connection });
        broadcastQueue = new Queue('broadcast-emails', { connection });

        // Create workers
        sequenceWorker = new Worker('sequence-emails', processSequenceEmails, { connection });
        broadcastWorker = new Worker('broadcast-emails', processBroadcastEmails, { connection });

        // Error handlers
        sequenceWorker.on('failed', (job, err) => {
            console.error('Sequence job failed:', err);
        });

        broadcastWorker.on('failed', (job, err) => {
            console.error('Broadcast job failed:', err);
        });

        initialized = true;
        console.log('✅ Redis queue processor initialized');
        return true;

    } catch (error) {
        console.warn('⚠️ Redis not available - queue features disabled. Error:', error.message);
        if (connection) {
            connection.disconnect();
            connection = null;
        }
        return false;
    }
}

/**
 * Process sequence emails job
 */
async function processSequenceEmails(job) {
    console.log('🔄 Processing sequence emails...');

    const now = new Date();

    // Find subscribers due for next email
    const subscribers = await Subscriber.find({
        currentSequence: { $ne: null },
        nextEmailAt: { $lte: now },
        status: 'active'
    }).limit(100).populate('currentSequence');

    console.log(`Found ${subscribers.length} subscribers due for sequence email`);

    for (const subscriber of subscribers) {
        try {
            const sequence = subscriber.currentSequence;
            if (!sequence || !sequence.isActive) {
                subscriber.currentSequence = null;
                subscriber.currentSequenceStep = 0;
                subscriber.nextEmailAt = null;
                await subscriber.save();
                continue;
            }

            const currentStep = sequence.steps[subscriber.currentSequenceStep];
            if (!currentStep) {
                subscriber.currentSequence = null;
                subscriber.currentSequenceStep = 0;
                subscriber.nextEmailAt = null;
                await subscriber.save();

                sequence.stats.currentlyActive = Math.max(0, sequence.stats.currentlyActive - 1);
                sequence.stats.completed++;
                await sequence.save();

                console.log(`✅ Subscriber ${subscriber.email} completed sequence ${sequence.name}`);
                continue;
            }

            const user = await User.findById(subscriber.userId);
            if (!user) continue;

            const result = await sendSequenceEmail(sequence, currentStep, subscriber, user);

            if (result.success) {
                const nextStepIndex = subscriber.currentSequenceStep + 1;
                const nextStep = sequence.steps[nextStepIndex];

                if (nextStep) {
                    subscriber.currentSequenceStep = nextStepIndex;
                    subscriber.nextEmailAt = new Date(now.getTime() + nextStep.delayHours * 60 * 60 * 1000);
                } else {
                    subscriber.currentSequence = null;
                    subscriber.currentSequenceStep = 0;
                    subscriber.nextEmailAt = null;

                    sequence.stats.currentlyActive = Math.max(0, sequence.stats.currentlyActive - 1);
                    sequence.stats.completed++;
                    await sequence.save();
                }

                await subscriber.save();
                console.log(`📧 Sent step ${currentStep.order + 1} to ${subscriber.email}`);
            } else {
                console.error(`Failed to send to ${subscriber.email}:`, result.error);
            }

        } catch (error) {
            console.error(`Error processing subscriber ${subscriber._id}:`, error);
        }
    }

    return { processed: subscribers.length };
}

/**
 * Process broadcast emails job
 */
async function processBroadcastEmails(job) {
    const { broadcastId } = job.data;

    console.log(`📢 Processing broadcast ${broadcastId}...`);

    const broadcast = await Broadcast.findById(broadcastId);
    if (!broadcast || broadcast.status !== 'sending') {
        console.log('Broadcast not found or already processed');
        return;
    }

    const user = await User.findById(broadcast.userId);
    if (!user) {
        console.log('User not found');
        return;
    }

    const recipientQuery = {
        userId: broadcast.userId,
        status: 'active'
    };

    if (broadcast.recipients.tags?.length > 0) {
        recipientQuery.tags = { $in: broadcast.recipients.tags };
    }

    if (broadcast.recipients.excludeInSequence) {
        recipientQuery.currentSequence = null;
    }

    const subscribers = await Subscriber.find(recipientQuery);
    console.log(`Sending to ${subscribers.length} subscribers`);

    const results = await sendBroadcast(broadcast, subscribers, user);

    broadcast.status = 'sent';
    broadcast.sentAt = new Date();
    broadcast.stats.sent = results.sent;
    await broadcast.save();

    console.log(`✅ Broadcast complete: ${results.sent} sent, ${results.failed} failed`);

    return results;
}

/**
 * Start the sequence processor
 */
export async function startSequenceProcessor() {
    const ready = await initialize();
    if (!ready) {
        console.log('⚠️ Sequence processor not started (Redis unavailable)');
        return false;
    }

    await sequenceQueue.add('process-sequences', {}, {
        repeat: {
            every: 5 * 60 * 1000 // 5 minutes
        }
    });

    console.log('🚀 Sequence processor started (runs every 5 minutes)');
    return true;
}

/**
 * Queue a broadcast for sending
 */
export async function queueBroadcast(broadcastId) {
    const ready = await initialize();
    if (!ready) {
        throw new Error('Redis queue not available');
    }

    await broadcastQueue.add('send-broadcast', { broadcastId });
    console.log(`📫 Broadcast ${broadcastId} queued for sending`);
}

export default {
    startSequenceProcessor,
    queueBroadcast
};
