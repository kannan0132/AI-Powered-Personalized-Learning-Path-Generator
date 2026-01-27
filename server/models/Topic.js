const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'AI/ML', 'General']
    },
    description: {
        type: String,
        default: ''
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    parentTopic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        default: null
    },
    relatedTopics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    }],
    prerequisites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    }],
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Topic', topicSchema);
