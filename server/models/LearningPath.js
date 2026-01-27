const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    type: {
        type: String,
        enum: ['short-term', 'long-term', 'skill-based', 'goal-based'],
        default: 'skill-based'
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Mixed'],
        default: 'Beginner'
    },
    targetGoal: {
        type: String,
        default: ''
    },
    estimatedDuration: {
        type: String, // e.g., "4 weeks", "2 months"
        default: ''
    },
    totalHours: {
        type: Number,
        default: 0
    },
    courses: [{
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        order: Number,
        status: {
            type: String,
            enum: ['not_started', 'in_progress', 'completed', 'skipped'],
            default: 'not_started'
        },
        startedAt: Date,
        completedAt: Date,
        progress: {
            type: Number,
            default: 0
        }
    }],
    focusAreas: [{
        type: String
    }],
    weakTopics: [{
        type: String
    }],
    strongTopics: [{
        type: String
    }],
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'paused', 'abandoned'],
        default: 'active'
    },
    generatedBy: {
        type: String,
        enum: ['ai', 'manual', 'assessment'],
        default: 'ai'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate overall progress
learningPathSchema.methods.calculateProgress = function () {
    if (!this.courses || this.courses.length === 0) return 0;

    const completedCount = this.courses.filter(c => c.status === 'completed').length;
    return Math.round((completedCount / this.courses.length) * 100);
};

// Update progress before saving
learningPathSchema.pre('save', function (next) {
    this.progress = this.calculateProgress();
    this.lastUpdated = Date.now();

    if (this.progress === 100) {
        this.status = 'completed';
    }
    next();
});

module.exports = mongoose.model('LearningPath', learningPathSchema);
