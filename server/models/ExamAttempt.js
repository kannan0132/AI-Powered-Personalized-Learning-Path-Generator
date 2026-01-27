const mongoose = require('mongoose');

const examAttemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'abandoned', 'timed_out'],
        default: 'in_progress'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    submittedAt: {
        type: Date
    },
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        selectedAnswer: Number,
        isCorrect: Boolean,
        timeTaken: Number // Seconds spent on this question
    }],
    score: {
        type: Number,
        default: 0
    },
    maxScore: {
        type: Number,
        default: 0
    },
    percentage: {
        type: Number,
        default: 0
    },
    passed: {
        type: Boolean,
        default: false
    },
    totalTimeTaken: {
        type: Number, // Total seconds
        default: 0
    },
    attemptNumber: {
        type: Number,
        default: 1
    }
});

// Compound index for user exam attempts
examAttemptSchema.index({ user: 1, exam: 1, attemptNumber: 1 });
examAttemptSchema.index({ user: 1, course: 1 });

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);
