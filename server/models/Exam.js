const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    passingScore: {
        type: Number,
        default: 70, // Percentage required to pass
        min: 0,
        max: 100
    },
    duration: {
        type: Number, // Duration in minutes
        default: 60
    },
    maxAttempts: {
        type: Number,
        default: 3
    },
    instructions: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient lookups
examSchema.index({ course: 1, isActive: 1 });

module.exports = mongoose.model('Exam', examSchema);
