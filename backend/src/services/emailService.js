import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';
import EmailLog from '../models/EmailLog.js';
import Subscriber from '../models/Subscriber.js';

// Only initialize Resend if API key is properly configured
const RESEND_ENABLED = process.env.RESEND_API_KEY &&
    !process.env.RESEND_API_KEY.includes('xxxxxxxx');

let resend = null;
if (RESEND_ENABLED) {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend email service initialized');
} else {
    console.warn('⚠️ Resend not configured - emails will be logged but not sent');
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'hello@plainly.email';
const FROM_NAME = process.env.FROM_NAME || 'Plainly';
const APP_URL = process.env.APP_URL || 'http://localhost:5000';

/**
 * Replace merge tags in email content
 */
function replaceMergeTags(content, subscriber) {
    let result = content;

    // Replace {first_name} with subscriber's name or fallback
    const firstName = subscriber.firstName || 'there';
    result = result.replace(/\{first_name\}/gi, firstName);
    result = result.replace(/\{email\}/gi, subscriber.email);

    return result;
}

/**
 * Generate tracking links and pixels
 */
function addTracking(body, emailLogId) {
    // Add open tracking pixel at the end
    const trackingPixel = `\n\n[This email was sent via Plainly]\n---\n${APP_URL}/api/track/open/${emailLogId}`;

    // For plain text, we can't really track clicks inline easily
    // In production, you'd convert URLs to tracked redirects
    return body + trackingPixel;
}

/**
 * Generate unsubscribe link
 */
function getUnsubscribeUrl(token) {
    return `${APP_URL}/api/unsubscribe/${token}`;
}

/**
 * Send a single email
 */
export async function sendEmail({
    userId,
    subscriberId,
    subscriber,
    subject,
    body,
    type,        // 'sequence' | 'broadcast'
    referenceId, // Sequence or Broadcast ID
    sequenceStep // Only for sequence emails
}) {
    try {
        // Generate tokens for tracking
        const openToken = uuidv4();
        const unsubscribeToken = uuidv4();

        // Create email log first
        const emailLog = new EmailLog({
            userId,
            subscriberId,
            type,
            referenceId,
            sequenceStep,
            subject,
            openToken,
            unsubscribeToken
        });
        await emailLog.save();

        // Process content
        const personalizedSubject = replaceMergeTags(subject, subscriber);
        let personalizedBody = replaceMergeTags(body, subscriber);

        // Add footer with unsubscribe
        const footer = `\n\n---\nUnsubscribe: ${getUnsubscribeUrl(unsubscribeToken)}`;
        personalizedBody += footer;

        // Demo mode: log but don't actually send
        if (!RESEND_ENABLED) {
            console.log(`📧 [DEMO MODE] Would send to ${subscriber.email}: ${personalizedSubject}`);
            emailLog.sentAt = new Date();
            await emailLog.save();
            return { success: true, emailLogId: emailLog._id, demo: true };
        }

        // Send via Resend
        const { data, error } = await resend.emails.send({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: subscriber.email,
            subject: personalizedSubject,
            text: personalizedBody,
            headers: {
                'X-Entity-Ref-ID': emailLog._id.toString(),
                'List-Unsubscribe': `<${getUnsubscribeUrl(unsubscribeToken)}>`
            }
        });

        if (error) {
            console.error('Email send error:', error);
            emailLog.bouncedAt = new Date();
            emailLog.bounceType = 'soft';
            await emailLog.save();
            return { success: false, error };
        }

        console.log(`✉️ Email sent to ${subscriber.email}: ${personalizedSubject}`);
        return { success: true, emailLogId: emailLog._id };

    } catch (error) {
        console.error('Email service error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send broadcast to multiple subscribers
 */
export async function sendBroadcast(broadcast, subscribers, user) {
    const results = {
        sent: 0,
        failed: 0,
        errors: []
    };

    for (const subscriber of subscribers) {
        // Check daily send limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (user.dailyEmailsSent.date < today) {
            user.dailyEmailsSent = { count: 0, date: today };
        }

        if (user.dailyEmailsSent.count >= user.plan.dailySendLimit) {
            results.errors.push('Daily send limit reached');
            break;
        }

        const result = await sendEmail({
            userId: user._id,
            subscriberId: subscriber._id,
            subscriber,
            subject: broadcast.subject,
            body: broadcast.body,
            type: 'broadcast',
            referenceId: broadcast._id
        });

        if (result.success) {
            results.sent++;
            user.dailyEmailsSent.count++;
        } else {
            results.failed++;
            results.errors.push(result.error);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    await user.save();
    return results;
}

/**
 * Send sequence email to a subscriber
 */
export async function sendSequenceEmail(sequence, step, subscriber, user) {
    const result = await sendEmail({
        userId: user._id,
        subscriberId: subscriber._id,
        subscriber,
        subject: step.subject,
        body: step.body,
        type: 'sequence',
        referenceId: sequence._id,
        sequenceStep: step.order
    });

    if (result.success) {
        // Update daily send count
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (user.dailyEmailsSent.date < today) {
            user.dailyEmailsSent = { count: 0, date: today };
        }
        user.dailyEmailsSent.count++;
        await user.save();
    }

    return result;
}

/**
 * Handle open tracking
 */
export async function trackOpen(openToken) {
    try {
        const emailLog = await EmailLog.findOne({ openToken });
        if (emailLog && !emailLog.openedAt) {
            emailLog.openedAt = new Date();
            await emailLog.save();

            // Update broadcast stats if applicable
            if (emailLog.type === 'broadcast') {
                const Broadcast = (await import('../models/Broadcast.js')).default;
                await Broadcast.findByIdAndUpdate(emailLog.referenceId, {
                    $inc: { 'stats.opened': 1 }
                });
            }
        }
        return true;
    } catch (error) {
        console.error('Track open error:', error);
        return false;
    }
}

/**
 * Handle unsubscribe
 */
export async function handleUnsubscribe(unsubscribeToken) {
    try {
        const emailLog = await EmailLog.findOne({ unsubscribeToken });
        if (!emailLog) return { success: false, message: 'Invalid link' };

        const subscriber = await Subscriber.findById(emailLog.subscriberId);
        if (!subscriber) return { success: false, message: 'Subscriber not found' };

        // Unsubscribe
        subscriber.status = 'unsubscribed';
        subscriber.unsubscribedAt = new Date();
        subscriber.currentSequence = null;
        subscriber.currentSequenceStep = 0;
        subscriber.nextEmailAt = null;
        await subscriber.save();

        // Update broadcast stats if applicable
        if (emailLog.type === 'broadcast') {
            const Broadcast = (await import('../models/Broadcast.js')).default;
            await Broadcast.findByIdAndUpdate(emailLog.referenceId, {
                $inc: { 'stats.unsubscribed': 1 }
            });
        }

        return { success: true, message: 'You have been unsubscribed' };
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return { success: false, message: 'An error occurred' };
    }
}

export default {
    sendEmail,
    sendBroadcast,
    sendSequenceEmail,
    trackOpen,
    handleUnsubscribe
};
