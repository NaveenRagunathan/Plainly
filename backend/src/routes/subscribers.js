import express from 'express';
import { auth } from '../middleware/auth.js';
import Subscriber from '../models/Subscriber.js';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify/sync';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/subscribers - List subscribers
router.get('/', auth, async (req, res, next) => {
    try {
        const { page = 1, limit = 50, status, tag, search } = req.query;

        const query = { userId: req.userId };

        if (status) query.status = status;
        if (tag) query.tags = tag;
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Subscriber.countDocuments(query);
        const subscribers = await Subscriber.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('currentSequence', 'name');

        res.json({
            success: true,
            data: {
                subscribers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/subscribers/stats - Get subscriber stats
router.get('/stats', auth, async (req, res, next) => {
    try {
        const userId = req.userId;

        const [total, active, unsubscribed, bounced] = await Promise.all([
            Subscriber.countDocuments({ userId }),
            Subscriber.countDocuments({ userId, status: 'active' }),
            Subscriber.countDocuments({ userId, status: 'unsubscribed' }),
            Subscriber.countDocuments({ userId, status: 'bounced' })
        ]);

        // Subscribers added in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newLast7Days = await Subscriber.countDocuments({
            userId,
            createdAt: { $gte: sevenDaysAgo }
        });

        // Get all unique tags
        const tags = await Subscriber.distinct('tags', { userId });

        res.json({
            success: true,
            data: {
                total,
                active,
                unsubscribed,
                bounced,
                newLast7Days,
                tags
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/subscribers - Create subscriber
router.post('/', auth, async (req, res, next) => {
    try {
        const { email, firstName, tags } = req.body;

        // Check subscriber limit
        const count = await Subscriber.countDocuments({ userId: req.userId });
        if (count >= req.user.plan.subscriberLimit) {
            return res.status(403).json({
                success: false,
                message: `Subscriber limit reached (${req.user.plan.subscriberLimit}). Upgrade your plan.`
            });
        }

        const subscriber = new Subscriber({
            userId: req.userId,
            email,
            firstName: firstName || '',
            tags: tags || [],
            source: 'manual'
        });

        await subscriber.save();

        res.status(201).json({
            success: true,
            data: { subscriber }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Subscriber with this email already exists'
            });
        }
        next(error);
    }
});

// GET /api/subscribers/:id - Get single subscriber
router.get('/:id', auth, async (req, res, next) => {
    try {
        const subscriber = await Subscriber.findOne({
            _id: req.params.id,
            userId: req.userId
        }).populate('currentSequence', 'name');

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }

        res.json({
            success: true,
            data: { subscriber }
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/subscribers/:id - Update subscriber
router.put('/:id', auth, async (req, res, next) => {
    try {
        const { firstName, tags, status } = req.body;

        const subscriber = await Subscriber.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { firstName, tags, status },
            { new: true, runValidators: true }
        );

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }

        res.json({
            success: true,
            data: { subscriber }
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/subscribers/:id - Delete subscriber
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const subscriber = await Subscriber.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }

        res.json({
            success: true,
            message: 'Subscriber deleted'
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/subscribers/import - Import from CSV
router.post('/import', auth, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const records = [];
        const parser = parse(req.file.buffer, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        for await (const record of parser) {
            records.push(record);
        }

        // Check subscriber limit
        const currentCount = await Subscriber.countDocuments({ userId: req.userId });
        const availableSlots = req.user.plan.subscriberLimit - currentCount;

        if (records.length > availableSlots) {
            return res.status(403).json({
                success: false,
                message: `Can only import ${availableSlots} more subscribers. Upgrade to import all.`
            });
        }

        let imported = 0;
        let skipped = 0;
        const errors = [];

        for (const record of records) {
            const email = record.email || record.Email || record.EMAIL;
            if (!email) {
                skipped++;
                continue;
            }

            try {
                await Subscriber.create({
                    userId: req.userId,
                    email: email.toLowerCase(),
                    firstName: record.firstName || record.first_name || record.name || '',
                    tags: record.tags ? record.tags.split(',').map(t => t.trim()) : [],
                    source: 'import'
                });
                imported++;
            } catch (err) {
                if (err.code === 11000) {
                    skipped++;
                } else {
                    errors.push(`Row error: ${err.message}`);
                }
            }
        }

        res.json({
            success: true,
            data: {
                imported,
                skipped,
                errors: errors.slice(0, 5)
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/subscribers/export - Export to CSV
router.get('/export/csv', auth, async (req, res, next) => {
    try {
        const subscribers = await Subscriber.find({
            userId: req.userId,
            status: 'active'
        }).lean();

        const data = subscribers.map(s => ({
            email: s.email,
            firstName: s.firstName,
            tags: s.tags.join(','),
            status: s.status,
            createdAt: s.createdAt
        }));

        const csv = stringify(data, { header: true });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=subscribers.csv');
        res.send(csv);
    } catch (error) {
        next(error);
    }
});

// POST /api/subscribers/:id/tags - Add tag
router.post('/:id/tags', auth, async (req, res, next) => {
    try {
        const { tag } = req.body;

        const subscriber = await Subscriber.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { $addToSet: { tags: tag } },
            { new: true }
        );

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }

        res.json({
            success: true,
            data: { subscriber }
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/subscribers/:id/tags/:tag - Remove tag
router.delete('/:id/tags/:tag', auth, async (req, res, next) => {
    try {
        const subscriber = await Subscriber.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { $pull: { tags: req.params.tag } },
            { new: true }
        );

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }

        res.json({
            success: true,
            data: { subscriber }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
