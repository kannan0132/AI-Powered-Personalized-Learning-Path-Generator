const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'AI/ML', 'General']
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    thumbnail: {
        type: String,
        default: ''
    },
    duration: {
        type: String, // e.g., "4 hours", "2 weeks"
        default: ''
    },
    prerequisites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    tags: [{
        type: String
    }],
    lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    totalLessons: {
        type: Number,
        default: 0
    },
    enrolledCount: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update totalLessons count
courseSchema.pre('save', function () {
    if (this.lessons) {
        this.totalLessons = this.lessons.length;
    }
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Course', courseSchema);
