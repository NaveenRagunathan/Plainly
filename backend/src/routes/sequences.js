import express from 'express';
import { auth } from '../middleware/auth.js';
import Sequence from '../models/Sequence.js';
import Subscriber from '../models/Subscriber.js';

const router = express.Router();

// GET /api/sequences - List sequences
router.get('/', auth, async (req, res, next) => {
    try {
        const sequences = await Sequence.find({ userId: req.userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: { sequences }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/sequences - Create sequence
router.post('/', auth, async (req, res, next) => {
    try {
        const { name, steps } = req.body;

        const sequence = new Sequence({
            userId: req.userId,
            name,
            steps: steps || []
        });

        await sequence.save();

        res.status(201).json({
            success: true,
            data: { sequence }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/sequences/:id - Get single sequence
router.get('/:id', auth, async (req, res, next) => {
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

        // Get active subscribers in this sequence
        const activeSubscribers = await Subscriber.countDocuments({
            currentSequence: sequence._id
        });

        res.json({
            success: true,
            data: {
                sequence,
                activeSubscribers
            }
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/sequences/:id - Update sequence
router.put('/:id', auth, async (req, res, next) => {
    try {
        const { name, steps, isActive } = req.body;

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

        if (name) sequence.name = name;
        if (steps) {
            // Re-order steps
            sequence.steps = steps.map((step, index) => ({
                ...step,
                order: index
            }));
        }
        if (typeof isActive === 'boolean') sequence.isActive = isActive;

        await sequence.save();

        res.json({
            success: true,
            data: { sequence }
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/sequences/:id - Delete sequence
router.delete('/:id', auth, async (req, res, next) => {
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

        // Remove subscribers from this sequence
        await Subscriber.updateMany(
            { currentSequence: sequence._id },
            {
                $unset: { currentSequence: 1, currentSequenceStep: 1, sequenceStartedAt: 1, nextEmailAt: 1 }
            }
        );

        await sequence.deleteOne();

        res.json({
            success: true,
            message: 'Sequence deleted'
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/sequences/:id/steps - Add step
router.post('/:id/steps', auth, async (req, res, next) => {
    try {
        const { subject, body, delayHours } = req.body;

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

        sequence.steps.push({
            order: sequence.steps.length,
            subject,
            body,
            delayHours: delayHours || 24
        });

        await sequence.save();

        res.status(201).json({
            success: true,
            data: { sequence }
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/sequences/:id/steps/:stepId - Update step
router.put('/:id/steps/:stepId', auth, async (req, res, next) => {
    try {
        const { subject, body, delayHours } = req.body;

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

        const step = sequence.steps.id(req.params.stepId);
        if (!step) {
            return res.status(404).json({
                success: false,
                message: 'Step not found'
            });
        }

        if (subject) step.subject = subject;
        if (body) step.body = body;
        if (delayHours !== undefined) step.delayHours = delayHours;

        await sequence.save();

        res.json({
            success: true,
            data: { sequence }
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/sequences/:id/steps/:stepId - Delete step
router.delete('/:id/steps/:stepId', auth, async (req, res, next) => {
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

        sequence.steps.pull(req.params.stepId);

        // Re-order remaining steps
        sequence.steps.forEach((step, index) => {
            step.order = index;
        });

        await sequence.save();

        res.json({
            success: true,
            data: { sequence }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/sequences/:id/assign - Assign subscribers to sequence
router.post('/:id/assign', auth, async (req, res, next) => {
    try {
        const { subscriberIds } = req.body;

        const sequence = await Sequence.findOne({
            _id: req.params.id,
            userId: req.userId,
            isActive: true
        });

        if (!sequence) {
            return res.status(404).json({
                success: false,
                message: 'Sequence not found or not active'
            });
        }

        if (sequence.steps.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot assign subscribers to a sequence with no steps'
            });
        }

        // Find subscribers not already in a sequence
        const subscribers = await Subscriber.find({
            _id: { $in: subscriberIds },
            userId: req.userId,
            status: 'active',
            currentSequence: null
        });

        const now = new Date();
        const firstStepDelay = sequence.steps[0].delayHours || 0;
        const nextEmailAt = new Date(now.getTime() + firstStepDelay * 60 * 60 * 1000);

        // Assign to sequence
        const result = await Subscriber.updateMany(
            { _id: { $in: subscribers.map(s => s._id) } },
            {
                currentSequence: sequence._id,
                currentSequenceStep: 0,
                sequenceStartedAt: now,
                nextEmailAt
            }
        );

        // Update sequence stats
        sequence.stats.totalEnrolled += result.modifiedCount;
        sequence.stats.currentlyActive += result.modifiedCount;
        await sequence.save();

        res.json({
            success: true,
            data: {
                assigned: result.modifiedCount,
                skipped: subscriberIds.length - result.modifiedCount
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/sequences/:id/remove - Remove subscribers from sequence
router.post('/:id/remove', auth, async (req, res, next) => {
    try {
        const { subscriberIds } = req.body;

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

        const result = await Subscriber.updateMany(
            {
                _id: { $in: subscriberIds },
                currentSequence: sequence._id
            },
            {
                $unset: { currentSequence: 1, currentSequenceStep: 1, sequenceStartedAt: 1, nextEmailAt: 1 }
            }
        );

        sequence.stats.currentlyActive -= result.modifiedCount;
        await sequence.save();

        res.json({
            success: true,
            data: { removed: result.modifiedCount }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
