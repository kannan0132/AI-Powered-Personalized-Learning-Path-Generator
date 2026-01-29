const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    submitFeedback,
    getMyFeedback,
    getAdminFeedback,
    updateFeedbackStatus
} = require('../controllers/feedbackController');

router.use(protect);

router.post('/', submitFeedback);
router.get('/my-feedback', getMyFeedback);

// Admin Routes
router.get('/admin', admin, getAdminFeedback);
router.put('/:id', admin, updateFeedbackStatus);

module.exports = router;
