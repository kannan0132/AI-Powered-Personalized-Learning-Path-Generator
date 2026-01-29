const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getDashboardStats,
    getUsers,
    updateUserRole,
    deleteUser,
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    createCourse,
    updateCourse,
    deleteCourse,
    getAllFeedback,
    respondToFeedback,
    blockUser,
    unblockUser,
    getSystemSettings,
    updateSystemSettings,
    adminLogin
} = require('../controllers/adminController');

// Admin login - public
router.post('/login', adminLogin);

// Dashboard
router.get('/stats', protect, admin, getDashboardStats);

// User Management
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);
router.put('/users/:id/block', protect, admin, blockUser);
router.put('/users/:id/unblock', protect, admin, unblockUser);

// Question Bank
router.get('/questions', protect, admin, getQuestions);
router.post('/questions', protect, admin, createQuestion);
router.put('/questions/:id', protect, admin, updateQuestion);
router.delete('/questions/:id', protect, admin, deleteQuestion);

// Course Management
router.post('/courses', protect, admin, createCourse);
router.put('/courses/:id', protect, admin, updateCourse);
router.delete('/courses/:id', protect, admin, deleteCourse);

// Feedback Management
router.get('/feedback', protect, admin, getAllFeedback);
router.put('/feedback/:id', protect, admin, respondToFeedback);

// System Settings
router.get('/settings', protect, admin, getSystemSettings);
router.put('/settings', protect, admin, updateSystemSettings);

module.exports = router;
