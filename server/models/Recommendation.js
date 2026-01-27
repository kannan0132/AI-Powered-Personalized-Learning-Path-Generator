const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['next_lesson', 'practice', 'revision', 'new_course', 'skill_gap', 'milestone'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    reason: {
        type: String, // Why this is recommended
        required: true
    },
    priority: {
        type: Number,
        default: 5,
        min: 1,
        max: 10
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'targetModel'
    },
    targetModel: {
        type: String,
        enum: ['Course', 'Lesson', 'Assessment', 'Topic']
    },
    metadata: {
        difficulty: String,
        category: String,
        estimatedTime: Number,
        relevanceScore: Number
    },
    status: {
        type: String,
        enum: ['pending', 'viewed', 'acted', 'dismissed', 'expired'],
        default: 'pending'
    },
    actionedAt: Date,
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
recommendationSchema.index({ user: 1, status: 1, priority: -1 });
recommendationSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
