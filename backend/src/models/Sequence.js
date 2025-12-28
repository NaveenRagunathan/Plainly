import mongoose from 'mongoose';

const sequenceStepSchema = new mongoose.Schema({
    order: {
        type: Number,
        required: true
    },
    delayHours: {
        type: Number,
        required: true,
        default: 24  // 1 day delay by default
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true
    }
}, { _id: true });

const sequenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    steps: [sequenceStepSchema],
    stats: {
        totalEnrolled: { type: Number, default: 0 },
        currentlyActive: { type: Number, default: 0 },
        completed: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

export default mongoose.model('Sequence', sequenceSchema);
