const express = require('express');
const router = express.Router();
const {
    getLessonsByCourse,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    getLessonNavigation
} = require('../controllers/lessonController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/course/:courseId', getLessonsByCourse);

// Protected routes
router.get('/:id', protect, getLessonById);
router.get('/:id/navigation', protect, getLessonNavigation);

// Admin routes
router.post('/', protect, admin, createLesson);
router.put('/reorder', protect, admin, reorderLessons);
router.put('/:id', protect, admin, updateLesson);
router.delete('/:id', protect, admin, deleteLesson);

module.exports = router;
