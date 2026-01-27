const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getExamForCourse,
    startExam,
    submitExam,
    getUserCertificates,
    getCertificateById,
    downloadCertificate,
    verifyCertificate
} = require('../controllers/certificationController');

// Public route - verify certificate
router.get('/verify/:code', verifyCertificate);

// Protected routes
router.use(protect);

// Exam routes
router.get('/exam/:courseId', getExamForCourse);
router.post('/exam/:courseId/start', startExam);
router.post('/exam/:attemptId/submit', submitExam);

// Certificate routes
router.get('/certificates', getUserCertificates);
router.get('/certificate/:id', getCertificateById);
router.get('/certificate/:id/download', downloadCertificate);

module.exports = router;
