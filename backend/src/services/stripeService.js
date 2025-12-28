import Stripe from 'stripe';
import User from '../models/User.js';

// Only initialize Stripe if API key is properly configured
const STRIPE_ENABLED = process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.includes('xxxxxxxx');

let stripe = null;
if (STRIPE_ENABLED) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialized');
} else {
    console.warn('⚠️ Stripe not configured - payment features disabled');
}

// Price IDs - these would be created in Stripe Dashboard
const PRICE_IDS = {
    starter: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    growth: process.env.STRIPE_GROWTH_PRICE_ID || 'price_growth',
    lifetime: process.env.STRIPE_LIFETIME_PRICE_ID || 'price_lifetime'
};

// Plan configurations
const PLANS = {
    starter: {
        name: 'Starter',
        price: 1900, // $19.00 in cents
        subscriberLimit: 5000,
        dailySendLimit: 25000,
        interval: 'month'
    },
    growth: {
        name: 'Growth',
        price: 3900, // $39.00 in cents
        subscriberLimit: 25000,
        dailySendLimit: 125000,
        interval: 'month'
    },
    lifetime: {
        name: 'Lifetime',
        price: 4900, // $49.00 one-time
        subscriberLimit: 2000,
        dailySendLimit: 10000,
        interval: 'once'
    }
};

/**
 * Create a Stripe customer for a user
 */
export async function createCustomer(user) {
    if (!STRIPE_ENABLED) {
        throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to .env');
    }
    try {
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: {
                userId: user._id.toString()
            }
        });

        user.stripeCustomerId = customer.id;
        await user.save();

        return customer;
    } catch (error) {
        console.error('Create customer error:', error);
        throw error;
    }
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(user, planType) {
    try {
        const plan = PLANS[planType];
        if (!plan) throw new Error('Invalid plan');

        // Ensure customer exists
        if (!user.stripeCustomerId) {
            await createCustomer(user);
        }

        const sessionConfig = {
            customer: user.stripeCustomerId,
            mode: plan.interval === 'once' ? 'payment' : 'subscription',
            success_url: `${process.env.APP_URL || 'http://localhost:5173'}/dashboard?payment=success`,
            cancel_url: `${process.env.APP_URL || 'http://localhost:5173'}/pricing?payment=cancelled`,
            metadata: {
                userId: user._id.toString(),
                planType
            }
        };

        if (plan.interval === 'once') {
            // One-time payment for lifetime
            sessionConfig.line_items = [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Plainly ${plan.name} Plan`,
                        description: `Up to ${plan.subscriberLimit} subscribers, lifetime access`
                    },
                    unit_amount: plan.price
                },
                quantity: 1
            }];
        } else {
            // Subscription
            sessionConfig.line_items = [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Plainly ${plan.name} Plan`,
                        description: `Up to ${plan.subscriberLimit} subscribers`
                    },
                    unit_amount: plan.price,
                    recurring: {
                        interval: plan.interval
                    }
                },
                quantity: 1
            }];
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);
        return session;
    } catch (error) {
        console.error('Create checkout session error:', error);
        throw error;
    }
}

/**
 * Create a billing portal session
 */
export async function createPortalSession(user) {
    try {
        if (!user.stripeCustomerId) {
            throw new Error('No billing account found');
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.APP_URL || 'http://localhost:5173'}/dashboard`
        });

        return session;
    } catch (error) {
        console.error('Create portal session error:', error);
        throw error;
    }
}

/**
 * Handle successful payment webhook
 */
export async function handlePaymentSuccess(session) {
    try {
        const { userId, planType } = session.metadata;
        const plan = PLANS[planType];

        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found for payment:', userId);
            return;
        }

        // Update user's plan
        user.plan = {
            type: planType,
            subscriberLimit: plan.subscriberLimit,
            dailySendLimit: plan.dailySendLimit
        };

        if (planType === 'lifetime') {
            user.lifetimePurchasedAt = new Date();
        }

        user.stripeSubscriptionId = session.subscription || null;
        await user.save();

        console.log(`✅ Plan upgraded to ${planType} for user ${user.email}`);
        return user;
    } catch (error) {
        console.error('Handle payment success error:', error);
        throw error;
    }
}

/**
 * Handle subscription cancellation
 */
export async function handleSubscriptionCancelled(subscription) {
    try {
        const customer = await stripe.customers.retrieve(subscription.customer);
        const userId = customer.metadata?.userId;

        if (!userId) return;

        const user = await User.findById(userId);
        if (!user) return;

        // Downgrade to free/starter
        user.plan = {
            type: 'starter',
            subscriberLimit: 5000,
            dailySendLimit: 25000
        };
        user.stripeSubscriptionId = null;
        await user.save();

        console.log(`⚠️ Subscription cancelled for user ${user.email}`);
        return user;
    } catch (error) {
        console.error('Handle cancellation error:', error);
        throw error;
    }
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(user) {
    try {
        if (!user.stripeSubscriptionId) {
            return {
                status: 'none',
                plan: user.plan.type,
                endsAt: null
            };
        }

        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

        return {
            status: subscription.status,
            plan: user.plan.type,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end
        };
    } catch (error) {
        console.error('Get subscription status error:', error);
        return { status: 'error' };
    }
}

export default {
    STRIPE_ENABLED,
    createCustomer,
    createCheckoutSession,
    createPortalSession,
    handlePaymentSuccess,
    handleSubscriptionCancelled,
    getSubscriptionStatus,
    PLANS
};
