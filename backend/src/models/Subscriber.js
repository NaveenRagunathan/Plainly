import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    firstName: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'unsubscribed', 'bounced'],
        default: 'active'
    },
    tags: [{
        type: String,
        trim: true
    }],
    // Sequence tracking - one sequence at a time
    currentSequence: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sequence',
        default: null
    },
    currentSequenceStep: {
        type: Number,
        default: 0
    },
    sequenceStartedAt: {
        type: Date,
        default: null
    },
    nextEmailAt: {
        type: Date,
        default: null
    },
    // Source tracking
    source: {
        type: String,
        enum: ['import', 'landing-page', 'api', 'manual'],
        default: 'manual'
    },
    landingPageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LandingPage'
    },
    unsubscribedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound index: unique email per user
subscriberSchema.index({ userId: 1, email: 1 }, { unique: true });

// Index for sequence processing
subscriberSchema.index({ currentSequence: 1, nextEmailAt: 1 });

// Index for tag queries
subscriberSchema.index({ userId: 1, tags: 1 });

export default mongoose.model('Subscriber', subscriberSchema);
