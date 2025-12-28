import express from 'express';
import { auth } from '../middleware/auth.js';
import Broadcast from '../models/Broadcast.js';
import Subscriber from '../models/Subscriber.js';

const router = express.Router();

// GET /api/broadcasts - List broadcasts
router.get('/', auth, async (req, res, next) => {
    try {
        const { status } = req.query;

        const query = { userId: req.userId };
        if (status) query.status = status;

        const broadcasts = await Broadcast.find(query)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: { broadcasts }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/broadcasts - Create broadcast
router.post('/', auth, async (req, res, next) => {
    try {
        const { subject, body, recipients, abTest } = req.body;

        const broadcast = new Broadcast({
            userId: req.userId,
            subject,
            body,
            recipients: recipients || {},
            abTest: abTest || { enabled: false }
        });

        if (abTest?.enabled) {
            broadcast.subjectB = req.body.subjectB;
        }

        await broadcast.save();

        res.status(201).json({
            success: true,
            data: { broadcast }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/broadcasts/:id - Get single broadcast
router.get('/:id', auth, async (req, res, next) => {
    try {
        const broadcast = await Broadcast.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!broadcast) {
            return res.status(404).json({
                success: false,
                message: 'Broadcast not found'
            });
        }

        res.json({
            success: true,
            data: { broadcast }
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/broadcasts/:id - Update broadcast
router.put('/:id', auth, async (req, res, next) => {
    try {
        const broadcast = await Broadcast.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!broadcast) {
            return res.status(404).json({
                success: false,
                message: 'Broadcast not found'
            });
        }

        if (broadcast.status === 'sent' || broadcast.status === 'sending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot edit a broadcast that has been sent or is sending'
            });
        }

        const { subject, subjectB, body, recipients, abTest } = req.body;

        if (subject) broadcast.subject = subject;
        if (subjectB !== undefined) broadcast.subjectB = subjectB;
        if (body) broadcast.body = body;
        if (recipients) broadcast.recipients = recipients;
        if (abTest) broadcast.abTest = { ...broadcast.abTest, ...abTest };

        await broadcast.save();

        res.json({
            success: true,
            data: { broadcast }
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/broadcasts/:id - Delete broadcast
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const broadcast = await Broadcast.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!broadcast) {
            return res.status(404).json({
                success: false,
                message: 'Broadcast not found'
            });
        }

        if (broadcast.status === 'sending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a broadcast that is currently sending'
            });
        }

        await broadcast.deleteOne();

        res.json({
            success: true,
            message: 'Broadcast deleted'
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/broadcasts/:id/schedule - Schedule broadcast
router.post('/:id/schedule', auth, async (req, res, next) => {
    try {
        const { scheduledAt } = req.body;

        const broadcast = await Broadcast.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!broadcast) {
            return res.status(404).json({
                success: false,
                message: 'Broadcast not found'
            });
        }

        if (broadcast.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Only draft broadcasts can be scheduled'
            });
        }

        const scheduleDate = new Date(scheduledAt);
        if (scheduleDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Scheduled time must be in the future'
            });
        }

        broadcast.scheduledAt = scheduleDate;
        broadcast.status = 'scheduled';
        await broadcast.save();

        res.json({
            success: true,
            data: { broadcast }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/broadcasts/:id/send - Send broadcast now
router.post('/:id/send', auth, async (req, res, next) => {
    try {
        const broadcast = await Broadcast.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!broadcast) {
            return res.status(404).json({
                success: false,
                message: 'Broadcast not found'
            });
        }

        if (broadcast.status !== 'draft' && broadcast.status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                message: 'Broadcast has already been sent'
            });
        }

        // Build recipient query
        const recipientQuery = {
            userId: req.userId,
            status: 'active'
        };

        if (broadcast.recipients.tags?.length > 0) {
            recipientQuery.tags = { $in: broadcast.recipients.tags };
        }

        if (broadcast.recipients.excludeInSequence) {
            recipientQuery.currentSequence = null;
        }

        const subscribers = await Subscriber.find(recipientQuery);
        const recipientCount = subscribers.length;

        if (recipientCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'No recipients match the criteria'
            });
        }

        // Check daily send limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (req.user.dailyEmailsSent.date < today) {
            req.user.dailyEmailsSent = { count: 0, date: today };
        }

        const remainingSends = req.user.plan.dailySendLimit - req.user.dailyEmailsSent.count;
        if (recipientCount > remainingSends) {
            return res.status(403).json({
                success: false,
                message: `Daily send limit would be exceeded. ${remainingSends} sends remaining today.`
            });
        }

        // Send emails synchronously (since Redis is usually not available on free tier)
        const { sendBroadcast } = await import('../services/emailService.js');

        broadcast.status = 'sending';
        await broadcast.save();

        const results = await sendBroadcast(broadcast, subscribers, req.user);

        // Update broadcast with results
        broadcast.status = 'sent';
        broadcast.sentAt = new Date();
        broadcast.stats.sent = results.sent;
        await broadcast.save();

        console.log(`✅ Broadcast sent: ${results.sent} emails, ${results.failed} failed`);

        res.json({
            success: true,
            data: {
                broadcast,
                recipientCount: results.sent,
                failed: results.failed
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/broadcasts/:id/cancel - Cancel scheduled broadcast
router.post('/:id/cancel', auth, async (req, res, next) => {
    try {
        const broadcast = await Broadcast.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!broadcast) {
            return res.status(404).json({
                success: false,
                message: 'Broadcast not found'
            });
        }

        if (broadcast.status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                message: 'Only scheduled broadcasts can be cancelled'
            });
        }

        broadcast.status = 'draft';
        broadcast.scheduledAt = null;
        await broadcast.save();

        res.json({
            success: true,
            data: { broadcast }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/broadcasts/:id/preview - Preview recipients
router.get('/:id/preview', auth, async (req, res, next) => {
    try {
        const broadcast = await Broadcast.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!broadcast) {
            return res.status(404).json({
                success: false,
                message: 'Broadcast not found'
            });
        }

        // Build recipient query
        const recipientQuery = {
            userId: req.userId,
            status: 'active'
        };

        if (broadcast.recipients.tags?.length > 0) {
            recipientQuery.tags = { $in: broadcast.recipients.tags };
        }

        if (broadcast.recipients.excludeInSequence) {
            recipientQuery.currentSequence = null;
        }

        const count = await Subscriber.countDocuments(recipientQuery);
        const sample = await Subscriber.find(recipientQuery)
            .limit(5)
            .select('email firstName');

        res.json({
            success: true,
            data: {
                count,
                sample
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
