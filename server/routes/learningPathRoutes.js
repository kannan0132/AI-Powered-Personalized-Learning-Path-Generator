const express = require('express');
const router = express.Router();
const {
    createLearningPath,
    getActivePath,
    getAllPaths,
    getPathById,
    updatePathStatus,
    getRecommendations,
    updateRecommendation,
    updateProgress
} = require('../controllers/learningPathController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Learning Path routes
router.post('/generate', createLearningPath);
router.get('/active', getActivePath);
router.get('/recommendations', getRecommendations);
router.put('/recommendations/:id', updateRecommendation);
router.put('/progress', updateProgress);
router.get('/', getAllPaths);
router.get('/:id', getPathById);
router.put('/:id/status', updatePathStatus);

module.exports = router;
