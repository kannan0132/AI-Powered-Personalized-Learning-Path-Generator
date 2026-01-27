const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started'
    },
    progressPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    timeSpent: {
        type: Number, // Time in seconds
        default: 0
    },
    startedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    },
    bookmarked: {
        type: Boolean,
        default: false
    }
});

// Compound index for efficient lookups
progressSchema.index({ user: 1, course: 1, lesson: 1 }, { unique: true });
progressSchema.index({ user: 1, status: 1 });

// Update lastAccessedAt on each save
progressSchema.pre('save', function (next) {
    this.lastAccessedAt = Date.now();
    next();
});

module.exports = mongoose.model('Progress', progressSchema);
