const express = require('express');
const router = express.Router();
const {
    getProgressStats,
    getCourseProgress,
    updateLessonProgress,
    getActivityTimeline,
    getWeeklyReport
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.get('/stats', getProgressStats);
router.get('/weekly', getWeeklyReport);
router.get('/activity', getActivityTimeline);
router.get('/course/:courseId', getCourseProgress);
router.put('/lesson/:lessonId', updateLessonProgress);

module.exports = router;
