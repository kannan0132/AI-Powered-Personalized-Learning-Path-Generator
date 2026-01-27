const express = require('express');
const router = express.Router();
const {
    getQuestions,
    submitAssessment,
    getAssessmentHistory,
    getAssessmentById,
    getCategories
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/categories', getCategories);

// Protected routes
router.get('/questions', protect, getQuestions);
router.post('/submit', protect, submitAssessment);
router.get('/history', protect, getAssessmentHistory);
router.get('/:id', protect, getAssessmentById);

module.exports = router;
