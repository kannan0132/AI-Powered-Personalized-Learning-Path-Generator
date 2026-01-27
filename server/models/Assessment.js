const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    maxScore: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Mixed'],
        default: 'Mixed'
    },
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        questionText: String,
        selectedAnswer: Number,
        correctAnswer: Number,
        isCorrect: Boolean,
        timeTaken: Number, // Seconds spent on this question
        category: String
    }],
    categoryScores: [{
        category: String,
        correct: Number,
        total: Number,
        percentage: Number
    }],
    skillGapAnalysis: {
        weakTopics: [String],
        strongTopics: [String]
    },
    totalTimeTaken: {
        type: Number,
        default: 0 // Total seconds for the assessment
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
