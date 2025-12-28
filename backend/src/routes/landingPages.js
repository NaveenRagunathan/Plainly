import express from 'express';
import { auth } from '../middleware/auth.js';
import LandingPage from '../models/LandingPage.js';
import Subscriber from '../models/Subscriber.js';
import Sequence from '../models/Sequence.js';

const router = express.Router();

// GET /api/landing-pages - List landing pages
router.get('/', auth, async (req, res, next) => {
    try {
        const landingPages = await LandingPage.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .populate('assignSequence', 'name');

        res.json({
            success: true,
            data: { landingPages }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/landing-pages - Create landing page
router.post('/', auth, async (req, res, next) => {
    try {
        const {
            slug, template, headline, subheadline, buttonText,
            backgroundImage, videoUrl, collectFirstName, assignTag,
            assignSequence, successMessage, redirectUrl, privacyPolicyUrl,
            socialProof
        } = req.body;

        // Validate slug format
        const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

        const landingPage = new LandingPage({
            userId: req.userId,
            slug: cleanSlug,
            template: template || 'minimal',
            headline,
            subheadline,
            buttonText: buttonText || 'Subscribe',
            backgroundImage,
            videoUrl,
            collectFirstName: collectFirstName !== false,
            assignTag,
            assignSequence,
            successMessage,
            redirectUrl,
            privacyPolicyUrl,
            socialProof
        });

        await landingPage.save();

        res.status(201).json({
            success: true,
            data: { landingPage }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A landing page with this slug already exists'
            });
        }
        next(error);
    }
});

// GET /api/landing-pages/:id - Get single landing page
router.get('/:id', auth, async (req, res, next) => {
    try {
        const landingPage = await LandingPage.findOne({
            _id: req.params.id,
            userId: req.userId
        }).populate('assignSequence', 'name');

        if (!landingPage) {
            return res.status(404).json({
                success: false,
                message: 'Landing page not found'
            });
        }

        res.json({
            success: true,
            data: { landingPage }
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/landing-pages/:id - Update landing page
router.put('/:id', auth, async (req, res, next) => {
    try {
        const landingPage = await LandingPage.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!landingPage) {
            return res.status(404).json({
                success: false,
                message: 'Landing page not found'
            });
        }

        const allowedFields = [
            'headline', 'subheadline', 'buttonText', 'backgroundImage',
            'videoUrl', 'collectFirstName', 'assignTag', 'assignSequence',
            'successMessage', 'redirectUrl', 'privacyPolicyUrl', 'socialProof',
            'template', 'isActive'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                landingPage[field] = req.body[field];
            }
        });

        // Handle slug update separately (needs validation)
        if (req.body.slug && req.body.slug !== landingPage.slug) {
            landingPage.slug = req.body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        }

        await landingPage.save();

        res.json({
            success: true,
            data: { landingPage }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A landing page with this slug already exists'
            });
        }
        next(error);
    }
});

// DELETE /api/landing-pages/:id - Delete landing page
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const landingPage = await LandingPage.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!landingPage) {
            return res.status(404).json({
                success: false,
                message: 'Landing page not found'
            });
        }

        res.json({
            success: true,
            message: 'Landing page deleted'
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/landing-pages/public/:username/:slug - Public landing page (no auth)
router.get('/public/:username/:slug', async (req, res, next) => {
    try {
        // Find user by username (we'll use email prefix for now)
        const User = (await import('../models/User.js')).default;
        const user = await User.findOne({
            email: { $regex: `^${req.params.username}@`, $options: 'i' }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        const landingPage = await LandingPage.findOne({
            userId: user._id,
            slug: req.params.slug,
            isActive: true
        });

        if (!landingPage) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Increment views
        landingPage.stats.views += 1;
        await landingPage.save();

        // Return public-safe data
        res.json({
            success: true,
            data: {
                landingPage: {
                    template: landingPage.template,
                    headline: landingPage.headline,
                    subheadline: landingPage.subheadline,
                    buttonText: landingPage.buttonText,
                    backgroundImage: landingPage.backgroundImage,
                    videoUrl: landingPage.videoUrl,
                    collectFirstName: landingPage.collectFirstName,
                    privacyPolicyUrl: landingPage.privacyPolicyUrl,
                    socialProof: landingPage.socialProof
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/landing-pages/public/:username/:slug/signup - Public signup (no auth)
router.post('/public/:username/:slug/signup', async (req, res, next) => {
    try {
        const { email, firstName } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user by username
        const User = (await import('../models/User.js')).default;
        const user = await User.findOne({
            email: { $regex: `^${req.params.username}@`, $options: 'i' }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        const landingPage = await LandingPage.findOne({
            userId: user._id,
            slug: req.params.slug,
            isActive: true
        });

        if (!landingPage) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Check subscriber limit
        const subscriberCount = await Subscriber.countDocuments({ userId: user._id });
        if (subscriberCount >= user.plan.subscriberLimit) {
            return res.status(200).json({
                success: true,
                data: {
                    message: landingPage.successMessage,
                    redirectUrl: landingPage.redirectUrl
                }
            });
        }

        // Create or update subscriber
        let subscriber = await Subscriber.findOne({
            userId: user._id,
            email: email.toLowerCase()
        });

        if (subscriber) {
            // Resubscribe if unsubscribed
            if (subscriber.status === 'unsubscribed') {
                subscriber.status = 'active';
                subscriber.unsubscribedAt = null;
            }
            if (firstName) subscriber.firstName = firstName;
            if (landingPage.assignTag) {
                subscriber.tags.addToSet(landingPage.assignTag);
            }
        } else {
            subscriber = new Subscriber({
                userId: user._id,
                email: email.toLowerCase(),
                firstName: firstName || '',
                source: 'landing-page',
                landingPageId: landingPage._id,
                tags: landingPage.assignTag ? [landingPage.assignTag] : []
            });
        }

        // Assign sequence if configured and subscriber not in one
        if (landingPage.assignSequence && !subscriber.currentSequence) {
            const sequence = await Sequence.findById(landingPage.assignSequence);
            if (sequence && sequence.isActive && sequence.steps.length > 0) {
                const now = new Date();
                const firstStepDelay = sequence.steps[0].delayHours || 0;
                subscriber.currentSequence = sequence._id;
                subscriber.currentSequenceStep = 0;
                subscriber.sequenceStartedAt = now;
                subscriber.nextEmailAt = new Date(now.getTime() + firstStepDelay * 60 * 60 * 1000);

                sequence.stats.totalEnrolled += 1;
                sequence.stats.currentlyActive += 1;
                await sequence.save();
            }
        }

        await subscriber.save();

        // Update landing page stats
        landingPage.stats.signups += 1;
        await landingPage.save();

        res.json({
            success: true,
            data: {
                message: landingPage.successMessage,
                redirectUrl: landingPage.redirectUrl
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate - return success anyway (don't reveal existing subscriber)
            const landingPage = await LandingPage.findOne({
                slug: req.params.slug
            });
            return res.json({
                success: true,
                data: {
                    message: landingPage?.successMessage || 'Thanks for subscribing!',
                    redirectUrl: landingPage?.redirectUrl
                }
            });
        }
        next(error);
    }
});

export default router;
