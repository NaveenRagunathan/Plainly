import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, name, plan } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Set plan limits
        const planLimits = {
            starter: { subscriberLimit: 5000, dailySendLimit: 25000 },
            growth: { subscriberLimit: 25000, dailySendLimit: 125000 },
            lifetime: { subscriberLimit: 2000, dailySendLimit: 10000 }
        };

        const selectedPlan = plan || 'starter';
        const limits = planLimits[selectedPlan] || planLimits.starter;

        // Create user
        const user = new User({
            email,
            password,
            name,
            plan: {
                type: selectedPlan,
                ...limits
            }
        });

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                user,
                token
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                user,
                token
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
    res.json({
        success: true,
        data: { user: req.user }
    });
});

// PUT /api/auth/onboarding
router.put('/onboarding', auth, async (req, res, next) => {
    try {
        const { creatorType, listSize } = req.body;

        req.user.onboarding = {
            completed: true,
            creatorType,
            listSize
        };

        await req.user.save();

        res.json({
            success: true,
            data: { user: req.user }
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res, next) => {
    try {
        const { name, businessName } = req.body;

        if (name) req.user.name = name;
        if (businessName !== undefined) req.user.businessName = businessName;

        await req.user.save();

        res.json({
            success: true,
            data: { user: req.user }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
