const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
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
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    },
    certificateNumber: {
        type: String,
        unique: true,
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    score: {
        type: Number, // Final exam score percentage
        required: true
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'Pass'],
        required: true
    },
    completionDate: {
        type: Date,
        default: Date.now
    },
    pdfPath: {
        type: String,
        default: ''
    },
    verificationCode: {
        type: String,
        unique: true
    },
    metadata: {
        courseDuration: String,
        lessonsCompleted: Number,
        totalTimeSpent: Number,
        issuerName: {
            type: String,
            default: 'AI Learning Platform'
        }
    },
    status: {
        type: String,
        enum: ['active', 'revoked'],
        default: 'active'
    }
});

// Generate unique certificate number before saving
certificateSchema.pre('save', async function (next) {
    if (!this.certificateNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.certificateNumber = `CERT-${year}${month}-${random}`;
    }
    if (!this.verificationCode) {
        this.verificationCode = `VER-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    }
    next();
});

// Calculate grade based on score
certificateSchema.pre('save', function (next) {
    if (this.score >= 95) this.grade = 'A+';
    else if (this.score >= 90) this.grade = 'A';
    else if (this.score >= 85) this.grade = 'B+';
    else if (this.score >= 80) this.grade = 'B';
    else if (this.score >= 75) this.grade = 'C+';
    else if (this.score >= 70) this.grade = 'C';
    else this.grade = 'Pass';
    next();
});

// Indexes
certificateSchema.index({ user: 1, course: 1 }, { unique: true });
certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ verificationCode: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
