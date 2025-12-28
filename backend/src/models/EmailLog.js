import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    subscriberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscriber',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['sequence', 'broadcast'],
        required: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true  // Points to Sequence or Broadcast
    },
    sequenceStep: {
        type: Number  // Only for sequence emails
    },
    subject: {
        type: String,
        required: true
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    openedAt: {
        type: Date
    },
    clickedAt: {
        type: Date
    },
    clicks: [{
        url: String,
        clickedAt: Date
    }],
    bouncedAt: {
        type: Date
    },
    bounceType: {
        type: String,
        enum: ['hard', 'soft']
    },
    // Tracking tokens
    openToken: {
        type: String,
        unique: true,
        sparse: true
    },
    unsubscribeToken: {
        type: String,
        unique: true,
        sparse: true
    }
}, {
    timestamps: true
});

// Indexes for analytics queries
emailLogSchema.index({ userId: 1, type: 1, sentAt: -1 });
emailLogSchema.index({ referenceId: 1, type: 1 });
emailLogSchema.index({ openToken: 1 });
emailLogSchema.index({ unsubscribeToken: 1 });

export default mongoose.model('EmailLog', emailLogSchema);
