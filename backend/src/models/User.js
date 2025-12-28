import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    businessName: {
        type: String,
        trim: true
    },
    plan: {
        type: {
            type: String,
            enum: ['starter', 'growth', 'lifetime'],
            default: 'starter'
        },
        subscriberLimit: {
            type: Number,
            default: 5000
        },
        dailySendLimit: {
            type: Number,
            default: 25000
        }
    },
    onboarding: {
        completed: { type: Boolean, default: false },
        creatorType: String,  // newsletter, course, community, products
        listSize: String      // 0, 1-500, 500-2000, 2000+
    },
    dailyEmailsSent: {
        count: { type: Number, default: 0 },
        date: { type: Date, default: Date.now }
    },
    // Stripe fields
    stripeCustomerId: {
        type: String
    },
    stripeSubscriptionId: {
        type: String
    },
    lifetimePurchasedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

export default mongoose.model('User', userSchema);
