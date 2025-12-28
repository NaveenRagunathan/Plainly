import mongoose from 'mongoose';

const landingPageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    template: {
        type: String,
        enum: ['minimal', 'side-by-side', 'hero', 'two-column', 'video'],
        default: 'minimal'
    },
    headline: {
        type: String,
        required: true,
        trim: true
    },
    subheadline: {
        type: String,
        trim: true
    },
    buttonText: {
        type: String,
        default: 'Subscribe',
        trim: true
    },
    backgroundImage: {
        type: String  // URL to image
    },
    videoUrl: {
        type: String  // YouTube/Vimeo URL for video template
    },
    collectFirstName: {
        type: Boolean,
        default: true
    },
    assignTag: {
        type: String,
        trim: true
    },
    assignSequence: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sequence'
    },
    successMessage: {
        type: String,
        default: "Thanks for subscribing! Check your inbox."
    },
    redirectUrl: {
        type: String  // Optional external redirect after signup
    },
    privacyPolicyUrl: {
        type: String
    },
    socialProof: {
        type: String  // e.g., "Join 1,247 readers"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    stats: {
        views: { type: Number, default: 0 },
        signups: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Compound index: unique slug per user
landingPageSchema.index({ userId: 1, slug: 1 }, { unique: true });

// Virtual for conversion rate
landingPageSchema.virtual('conversionRate').get(function () {
    if (this.stats.views === 0) return 0;
    return ((this.stats.signups / this.stats.views) * 100).toFixed(1);
});

landingPageSchema.set('toJSON', { virtuals: true });

export default mongoose.model('LandingPage', landingPageSchema);
