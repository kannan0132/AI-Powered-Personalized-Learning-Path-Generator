const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const Certificate = require('../models/Certificate');
const Question = require('../models/Question');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// @desc    Get exam for a course
// @route   GET /api/certification/exam/:courseId
// @access  Private
const getExamForCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Check if course exists and user has completed required lessons
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check lesson completion
        const courseLessons = await Lesson.countDocuments({ course: courseId });
        const completedLessons = await Progress.countDocuments({
            user: userId,
            course: courseId,
            status: 'completed'
        });

        const completionPercentage = courseLessons > 0
            ? Math.round((completedLessons / courseLessons) * 100)
            : 0;

        if (completionPercentage < 80) {
            return res.status(400).json({
                message: 'You must complete at least 80% of the course to take the final exam',
                completedLessons,
                totalLessons: courseLessons,
                completionPercentage
            });
        }

        // Get or create exam for this course
        let exam = await Exam.findOne({ course: courseId, isActive: true });

        if (!exam) {
            // Auto-generate exam from course category questions
            const questions = await Question.find({ category: course.category })
                .limit(20);

            if (questions.length < 10) {
                return res.status(400).json({
                    message: 'Not enough questions available for final exam'
                });
            }

            exam = await Exam.create({
                course: courseId,
                title: `${course.title} - Final Examination`,
                description: `Final exam for ${course.title}. Pass this exam to earn your certificate.`,
                questions: questions.map(q => q._id),
                passingScore: 70,
                duration: 60,
                maxAttempts: 3,
                instructions: 'Read each question carefully. You have 60 minutes to complete this exam.'
            });
        }

        // Get user's previous attempts
        const previousAttempts = await ExamAttempt.find({
            user: userId,
            exam: exam._id,
            status: 'completed'
        }).sort({ attemptNumber: -1 });

        const attemptsRemaining = exam.maxAttempts - previousAttempts.length;
        const hasPassed = previousAttempts.some(a => a.passed);

        res.json({
            exam: {
                _id: exam._id,
                title: exam.title,
                description: exam.description,
                duration: exam.duration,
                passingScore: exam.passingScore,
                totalQuestions: exam.questions.length,
                instructions: exam.instructions
            },
            course: {
                _id: course._id,
                title: course.title
            },
            attemptsRemaining,
            hasPassed,
            previousAttempts: previousAttempts.map(a => ({
                attemptNumber: a.attemptNumber,
                score: a.percentage,
                passed: a.passed,
                submittedAt: a.submittedAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Start final exam
// @route   POST /api/certification/exam/:courseId/start
// @access  Private
const startExam = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const exam = await Exam.findOne({ course: courseId, isActive: true })
            .populate('questions');

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Check attempts
        const previousAttempts = await ExamAttempt.countDocuments({
            user: userId,
            exam: exam._id,
            status: 'completed'
        });

        if (previousAttempts >= exam.maxAttempts) {
            return res.status(400).json({ message: 'Maximum attempts reached' });
        }

        // Check for existing in-progress attempt
        let attempt = await ExamAttempt.findOne({
            user: userId,
            exam: exam._id,
            status: 'in_progress'
        });

        if (!attempt) {
            attempt = await ExamAttempt.create({
                user: userId,
                exam: exam._id,
                course: courseId,
                attemptNumber: previousAttempts + 1,
                maxScore: exam.questions.length * 10
            });
        }

        // Return questions without correct answers
        const questions = exam.questions.map(q => ({
            _id: q._id,
            text: q.text,
            options: q.options,
            category: q.category,
            difficulty: q.difficulty,
            timeLimit: q.timeLimit
        }));

        res.json({
            attempt: {
                _id: attempt._id,
                attemptNumber: attempt.attemptNumber,
                startedAt: attempt.startedAt
            },
            exam: {
                _id: exam._id,
                title: exam.title,
                duration: exam.duration,
                passingScore: exam.passingScore
            },
            questions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit final exam
// @route   POST /api/certification/exam/:attemptId/submit
// @access  Private
const submitExam = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const { answers, totalTimeTaken } = req.body;
        const userId = req.user.id;

        const attempt = await ExamAttempt.findOne({
            _id: attemptId,
            user: userId,
            status: 'in_progress'
        }).populate('exam');

        if (!attempt) {
            return res.status(404).json({ message: 'Exam attempt not found' });
        }

        // Calculate score
        let score = 0;
        const detailedAnswers = [];

        for (const ans of answers) {
            const question = await Question.findById(ans.questionId);
            if (!question) continue;

            const isCorrect = question.correctAnswer === ans.selectedAnswer;
            const points = question.points || 10;

            if (isCorrect) {
                score += points;
            }

            detailedAnswers.push({
                questionId: question._id,
                selectedAnswer: ans.selectedAnswer,
                isCorrect,
                timeTaken: ans.timeTaken || 0
            });
        }

        const percentage = attempt.maxScore > 0
            ? Math.round((score / attempt.maxScore) * 100)
            : 0;
        const passed = percentage >= attempt.exam.passingScore;

        // Update attempt
        attempt.answers = detailedAnswers;
        attempt.score = score;
        attempt.percentage = percentage;
        attempt.passed = passed;
        attempt.status = 'completed';
        attempt.submittedAt = new Date();
        attempt.totalTimeTaken = totalTimeTaken || 0;
        await attempt.save();

        // If passed, generate certificate
        let certificate = null;
        if (passed) {
            certificate = await generateCertificate(userId, attempt.course, attempt.exam._id, percentage);
        }

        res.json({
            attempt: {
                _id: attempt._id,
                score,
                maxScore: attempt.maxScore,
                percentage,
                passed,
                submittedAt: attempt.submittedAt
            },
            certificate: certificate ? {
                _id: certificate._id,
                certificateNumber: certificate.certificateNumber,
                grade: certificate.grade
            } : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's certificates
// @route   GET /api/certification/certificates
// @access  Private
const getUserCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({
            user: req.user.id,
            status: 'active'
        })
            .populate('course', 'title category thumbnail')
            .sort({ issueDate: -1 });

        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single certificate
// @route   GET /api/certification/certificate/:id
// @access  Private
const getCertificateById = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id)
            .populate('course', 'title category description')
            .populate('user', 'name email');

        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        res.json(certificate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Download certificate PDF
// @route   GET /api/certification/certificate/:id/download
// @access  Private
const downloadCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id)
            .populate('course', 'title')
            .populate('user', 'name');

        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        // Generate PDF on-the-fly
        const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margin: 50
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            `attachment; filename=certificate-${certificate.certificateNumber}.pdf`);

        doc.pipe(res);

        // Certificate design
        // Border
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
            .stroke('#1e3a5f');
        doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
            .stroke('#1e3a5f');

        // Header
        doc.fontSize(14)
            .fillColor('#666')
            .text('AI LEARNING PLATFORM', 0, 60, { align: 'center' });

        // Title
        doc.fontSize(42)
            .fillColor('#1e3a5f')
            .text('Certificate of Completion', 0, 100, { align: 'center' });

        // Subtitle
        doc.fontSize(16)
            .fillColor('#666')
            .text('This is to certify that', 0, 180, { align: 'center' });

        // Name
        doc.fontSize(32)
            .fillColor('#1e3a5f')
            .text(certificate.user.name, 0, 210, { align: 'center' });

        // Course completion text
        doc.fontSize(16)
            .fillColor('#666')
            .text('has successfully completed the course', 0, 270, { align: 'center' });

        // Course name
        doc.fontSize(24)
            .fillColor('#1e3a5f')
            .text(certificate.course.title, 0, 300, { align: 'center' });

        // Score and grade
        doc.fontSize(14)
            .fillColor('#666')
            .text(`with a score of ${certificate.score}% (Grade: ${certificate.grade})`, 0, 350, { align: 'center' });

        // Date
        doc.fontSize(12)
            .text(`Issued on ${certificate.issueDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}`, 0, 380, { align: 'center' });

        // Certificate number and verification
        doc.fontSize(10)
            .fillColor('#999')
            .text(`Certificate No: ${certificate.certificateNumber}`, 100, 430)
            .text(`Verification Code: ${certificate.verificationCode}`, 100, 445);

        // Footer line
        doc.moveTo(250, 450)
            .lineTo(550, 450)
            .stroke('#1e3a5f');

        doc.fontSize(12)
            .fillColor('#666')
            .text('Authorized Signature', 0, 460, { align: 'center' });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify certificate
// @route   GET /api/certification/verify/:code
// @access  Public
const verifyCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findOne({
            $or: [
                { certificateNumber: req.params.code },
                { verificationCode: req.params.code }
            ]
        })
            .populate('course', 'title')
            .populate('user', 'name');

        if (!certificate) {
            return res.status(404).json({
                valid: false,
                message: 'Certificate not found'
            });
        }

        res.json({
            valid: certificate.status === 'active',
            certificate: {
                holderName: certificate.user.name,
                courseName: certificate.course.title,
                grade: certificate.grade,
                issueDate: certificate.issueDate,
                certificateNumber: certificate.certificateNumber,
                status: certificate.status
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to generate certificate
const generateCertificate = async (userId, courseId, examId, score) => {
    // Check if certificate already exists
    const existing = await Certificate.findOne({ user: userId, course: courseId });
    if (existing) return existing;

    // Get progress metadata
    const progress = await Progress.find({ user: userId, course: courseId });
    const totalTimeSpent = progress.reduce((acc, p) => acc + (p.timeSpent || 0), 0);

    const course = await Course.findById(courseId);

    const certificate = await Certificate.create({
        user: userId,
        course: courseId,
        exam: examId,
        score,
        metadata: {
            courseDuration: course?.duration || 'N/A',
            lessonsCompleted: progress.filter(p => p.status === 'completed').length,
            totalTimeSpent: Math.round(totalTimeSpent / 60) // Convert to minutes
        }
    });

    return certificate;
};

module.exports = {
    getExamForCourse,
    startExam,
    submitExam,
    getUserCertificates,
    getCertificateById,
    downloadCertificate,
    verifyCertificate
};
