const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['feedback', 'bug', 'feature', 'support'],
        required: true
    },
    subject: {
        type: String,
        required: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        maxlength: 2000
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved', 'closed'],
        default: 'pending'
    },
    response: {
        type: String
    },
    resolvedAt: Date,
    metadata: {
        page: String,
        browser: String,
        deviceType: String
    }
}, {
    timestamps: true
});

feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, priority: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
