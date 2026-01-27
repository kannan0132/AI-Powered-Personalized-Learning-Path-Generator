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
    respondToFeedback
} = require('../controllers/adminController');

// All routes require auth and admin role
router.use(protect);
router.use(admin);

// Dashboard
router.get('/stats', getDashboardStats);

// User Management
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Question Bank
router.get('/questions', getQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// Course Management
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Feedback Management
router.get('/feedback', getAllFeedback);
router.put('/feedback/:id', respondToFeedback);

module.exports = router;
