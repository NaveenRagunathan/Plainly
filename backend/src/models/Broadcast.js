import mongoose from 'mongoose';

const broadcastSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    subjectB: {
        type: String,
        trim: true  // For A/B testing
    },
    body: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'sending', 'sent'],
        default: 'draft'
    },
    scheduledAt: {
        type: Date
    },
    sentAt: {
        type: Date
    },
    recipients: {
        tags: [{ type: String }],  // Filter by tags
        excludeInSequence: { type: Boolean, default: false }
    },
    stats: {
        sent: { type: Number, default: 0 },
        opened: { type: Number, default: 0 },
        clicked: { type: Number, default: 0 },
        unsubscribed: { type: Number, default: 0 },
        bounced: { type: Number, default: 0 }
    },
    abTest: {
        enabled: { type: Boolean, default: false },
        testPercent: { type: Number, default: 20 },  // 10, 20, or 30
        winningMetric: { type: String, enum: ['opens', 'clicks'], default: 'opens' },
        waitHours: { type: Number, default: 4 },  // 2, 4, or 6
        winner: { type: String, enum: ['A', 'B'] },
        statsA: {
            sent: { type: Number, default: 0 },
            opened: { type: Number, default: 0 },
            clicked: { type: Number, default: 0 }
        },
        statsB: {
            sent: { type: Number, default: 0 },
            opened: { type: Number, default: 0 },
            clicked: { type: Number, default: 0 }
        }
    }
}, {
    timestamps: true
});

export default mongoose.model('Broadcast', broadcastSchema);
