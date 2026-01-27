const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getRecommendations,
    getNextBestLesson,
    getRevisionSuggestions,
    getWeakAreaPractice,
    updateRecommendationStatus
} = require('../controllers/recommendationController');

// All routes are protected
router.use(protect);

// Get all active recommendations
router.get('/', getRecommendations);

// Get next best lesson recommendation
router.get('/next-lesson', getNextBestLesson);

// Get revision suggestions
router.get('/revision', getRevisionSuggestions);

// Get weak-area practice questions
router.get('/practice', getWeakAreaPractice);

// Update recommendation status (mark as acted/dismissed)
router.put('/:id/action', updateRecommendationStatus);

module.exports = router;
