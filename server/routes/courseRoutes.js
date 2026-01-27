const express = require('express');
const router = express.Router();
const {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    togglePublish,
    getCategories,
    enrollCourse
} = require('../controllers/courseController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getCourses);
router.get('/categories', getCategories);
router.get('/:id', getCourseById);

// Protected routes
router.post('/:id/enroll', protect, enrollCourse);

// Admin routes
router.post('/', protect, admin, createCourse);
router.put('/:id', protect, admin, updateCourse);
router.delete('/:id', protect, admin, deleteCourse);
router.put('/:id/publish', protect, admin, togglePublish);

module.exports = router;
