const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getPerformanceAnalytics,
    getCourseAnalytics,
    getDifficultTopics
} = require('../controllers/analyticsController');

router.use(protect);

router.get('/performance', getPerformanceAnalytics);
router.get('/difficult-topics', getDifficultTopics);
router.get('/courses', admin, getCourseAnalytics);

module.exports = router;
