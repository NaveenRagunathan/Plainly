import express from 'express';
import { auth } from '../middleware/auth.js';
import Subscriber from '../models/Subscriber.js';
import Broadcast from '../models/Broadcast.js';
import Sequence from '../models/Sequence.js';
import EmailLog from '../models/EmailLog.js';

const router = express.Router();

// GET /api/analytics/overview - Dashboard overview
router.get('/overview', auth, async (req, res, next) => {
    try {
        const userId = req.userId;
        const now = new Date();

        // Date ranges
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Subscriber stats
        const [totalSubscribers, activeSubscribers, newLast7Days, newLast30Days] = await Promise.all([
            Subscriber.countDocuments({ userId }),
            Subscriber.countDocuments({ userId, status: 'active' }),
            Subscriber.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
            Subscriber.countDocuments({ userId, createdAt: { $gte: thirtyDaysAgo } })
        ]);

        // Email stats
        const [emailsSent7Days, emailsSent30Days] = await Promise.all([
            EmailLog.countDocuments({ userId, sentAt: { $gte: sevenDaysAgo } }),
            EmailLog.countDocuments({ userId, sentAt: { $gte: thirtyDaysAgo } })
        ]);

        // Average rates from recent broadcasts
        const recentBroadcasts = await Broadcast.find({
            userId,
            status: 'sent',
            sentAt: { $gte: thirtyDaysAgo }
        }).limit(10);

        let avgOpenRate = 0;
        let avgClickRate = 0;

        if (recentBroadcasts.length > 0) {
            const totals = recentBroadcasts.reduce((acc, b) => {
                if (b.stats.sent > 0) {
                    acc.opens += (b.stats.opened / b.stats.sent) * 100;
                    acc.clicks += (b.stats.clicked / b.stats.sent) * 100;
                    acc.count += 1;
                }
                return acc;
            }, { opens: 0, clicks: 0, count: 0 });

            if (totals.count > 0) {
                avgOpenRate = Math.round(totals.opens / totals.count);
                avgClickRate = Math.round(totals.clicks / totals.count);
            }
        }

        // Sequence stats
        const sequences = await Sequence.find({ userId });
        const totalInSequences = await Subscriber.countDocuments({
            userId,
            currentSequence: { $ne: null }
        });

        res.json({
            success: true,
            data: {
                subscribers: {
                    total: totalSubscribers,
                    active: activeSubscribers,
                    newLast7Days,
                    newLast30Days
                },
                emails: {
                    sent7Days: emailsSent7Days,
                    sent30Days: emailsSent30Days,
                    avgOpenRate,
                    avgClickRate
                },
                sequences: {
                    total: sequences.length,
                    active: sequences.filter(s => s.isActive).length,
                    subscribersInSequences: totalInSequences
                },
                plan: {
                    type: req.user.plan.type,
                    subscriberLimit: req.user.plan.subscriberLimit,
                    subscriberUsage: totalSubscribers,
                    dailySendLimit: req.user.plan.dailySendLimit,
                    dailySendsUsed: req.user.dailyEmailsSent.count
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/analytics/growth - Subscriber growth chart data
router.get('/growth', auth, async (req, res, next) => {
    try {
        const { days = 30 } = req.query;
        const userId = req.userId;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        startDate.setHours(0, 0, 0, 0);

        // Aggregate subscribers by day
        const growth = await Subscriber.aggregate([
            {
                $match: {
                    userId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing days with 0
        const data = [];
        const current = new Date(startDate);
        const today = new Date();

        while (current <= today) {
            const dateStr = current.toISOString().split('T')[0];
            const found = growth.find(g => g._id === dateStr);
            data.push({
                date: dateStr,
                count: found ? found.count : 0
            });
            current.setDate(current.getDate() + 1);
        }

        // Calculate cumulative totals
        const subscribersBeforeRange = await Subscriber.countDocuments({
            userId,
            createdAt: { $lt: startDate }
        });

        let cumulative = subscribersBeforeRange;
        const cumulativeData = data.map(d => {
            cumulative += d.count;
            return {
                ...d,
                total: cumulative
            };
        });

        res.json({
            success: true,
            data: { growth: cumulativeData }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/analytics/broadcasts/:id - Broadcast stats
router.get('/broadcasts/:id', auth, async (req, res, next) => {
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

        // Calculate rates
        const stats = {
            ...broadcast.stats,
            openRate: broadcast.stats.sent > 0
                ? ((broadcast.stats.opened / broadcast.stats.sent) * 100).toFixed(1)
                : 0,
            clickRate: broadcast.stats.sent > 0
                ? ((broadcast.stats.clicked / broadcast.stats.sent) * 100).toFixed(1)
                : 0,
            unsubscribeRate: broadcast.stats.sent > 0
                ? ((broadcast.stats.unsubscribed / broadcast.stats.sent) * 100).toFixed(2)
                : 0
        };

        res.json({
            success: true,
            data: {
                broadcast: {
                    _id: broadcast._id,
                    subject: broadcast.subject,
                    sentAt: broadcast.sentAt,
                    status: broadcast.status
                },
                stats
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/analytics/sequences/:id - Sequence stats
router.get('/sequences/:id', auth, async (req, res, next) => {
    try {
        const sequence = await Sequence.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!sequence) {
            return res.status(404).json({
                success: false,
                message: 'Sequence not found'
            });
        }

        // Get per-step stats from email logs
        const stepStats = await EmailLog.aggregate([
            {
                $match: {
                    referenceId: sequence._id,
                    type: 'sequence'
                }
            },
            {
                $group: {
                    _id: '$sequenceStep',
                    sent: { $sum: 1 },
                    opened: { $sum: { $cond: [{ $ne: ['$openedAt', null] }, 1, 0] } },
                    clicked: { $sum: { $cond: [{ $ne: ['$clickedAt', null] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Merge with sequence steps
        const stepsWithStats = sequence.steps.map((step, index) => {
            const stats = stepStats.find(s => s._id === index) || { sent: 0, opened: 0, clicked: 0 };
            return {
                order: step.order,
                subject: step.subject,
                delayHours: step.delayHours,
                stats: {
                    sent: stats.sent,
                    opened: stats.opened,
                    clicked: stats.clicked,
                    openRate: stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : 0,
                    clickRate: stats.sent > 0 ? ((stats.clicked / stats.sent) * 100).toFixed(1) : 0
                }
            };
        });

        res.json({
            success: true,
            data: {
                sequence: {
                    _id: sequence._id,
                    name: sequence.name,
                    isActive: sequence.isActive,
                    stats: sequence.stats
                },
                steps: stepsWithStats
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
