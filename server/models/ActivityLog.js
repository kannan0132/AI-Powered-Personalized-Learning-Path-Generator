const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'login',
            'logout',
            'lesson_started',
            'lesson_completed',
            'course_started',
            'course_completed',
            'assessment_started',
            'assessment_completed',
            'path_generated',
            'badge_earned',
            'streak_updated'
        ]
    },
    details: {
        targetId: mongoose.Schema.Types.ObjectId,
        targetType: String,
        title: String,
        score: Number,
        duration: Number,
        metadata: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ user: 1, action: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
