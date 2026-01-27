const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
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
    content: {
        type: String, // Rich text/HTML content
        required: true
    },
    contentType: {
        type: String,
        enum: ['video', 'text', 'mixed'],
        default: 'text'
    },
    videoUrl: {
        type: String,
        default: ''
    },
    resources: [{
        title: String,
        type: {
            type: String,
            enum: ['pdf', 'link', 'code', 'download']
        },
        url: String
    }],
    order: {
        type: Number,
        required: true
    },
    duration: {
        type: Number, // Duration in minutes
        default: 10
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    topics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    }],
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Lesson', lessonSchema);
