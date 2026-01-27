const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: Number, // Index of the correct option
        required: true
    },
    category: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true
    },
    tags: [{
        type: String
    }],
    points: {
        type: Number,
        default: 10 // Weighted scoring based on difficulty
    },
    explanation: {
        type: String,
        default: '' // Explanation shown after answering
    },
    timeLimit: {
        type: Number,
        default: 30 // Seconds allowed for this question
    }
});

module.exports = mongoose.model('Question', questionSchema);
