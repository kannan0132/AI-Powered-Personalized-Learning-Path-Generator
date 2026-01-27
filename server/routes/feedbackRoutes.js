const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { submitFeedback, getMyFeedback } = require('../controllers/feedbackController');

router.use(protect);

router.post('/', submitFeedback);
router.get('/my-feedback', getMyFeedback);

module.exports = router;
