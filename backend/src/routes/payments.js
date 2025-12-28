import express from 'express';
import { auth } from '../middleware/auth.js';
import stripeService from '../services/stripeService.js';
import Stripe from 'stripe';

const router = express.Router();

// Only initialize Stripe if API key is properly configured
const STRIPE_ENABLED = process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.includes('xxxxxxxx');

let stripe = null;
if (STRIPE_ENABLED) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Middleware to check if Stripe is enabled
const requireStripe = (req, res, next) => {
    if (!STRIPE_ENABLED) {
        return res.status(503).json({
            success: false,
            message: 'Payment processing is not configured. Please add STRIPE_SECRET_KEY to .env'
        });
    }
    next();
};

// POST /api/payments/create-checkout - Create checkout session
router.post('/create-checkout', auth, requireStripe, async (req, res, next) => {
    try {
        const { planType } = req.body;

        if (!['starter', 'growth', 'lifetime'].includes(planType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan type'
            });
        }

        const session = await stripeService.createCheckoutSession(req.user, planType);

        res.json({
            success: true,
            data: {
                sessionId: session.id,
                url: session.url
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/payments/portal - Create billing portal session
router.post('/portal', auth, requireStripe, async (req, res, next) => {
    try {
        const session = await stripeService.createPortalSession(req.user);

        res.json({
            success: true,
            data: {
                url: session.url
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/payments/subscription - Get subscription status
router.get('/subscription', auth, async (req, res, next) => {
    try {
        // This works even without Stripe - returns basic status
        const status = await stripeService.getSubscriptionStatus(req.user);

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/payments/webhook - Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!STRIPE_ENABLED) {
        return res.status(503).send('Stripe not configured');
    }

    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            if (session.payment_status === 'paid') {
                await stripeService.handlePaymentSuccess(session);
            }
            break;

        case 'customer.subscription.deleted':
            const subscription = event.data.object;
            await stripeService.handleSubscriptionCancelled(subscription);
            break;

        case 'invoice.payment_failed':
            console.log('Payment failed for invoice:', event.data.object.id);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

export default router;

