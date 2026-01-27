const Feedback = require('../models/Feedback');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res) => {
    try {
        const { type, subject, message, priority, metadata } = req.body;

        const feedback = await Feedback.create({
            user: req.user.id,
            type,
            subject,
            message,
            priority: priority || 'medium',
            metadata
        });

        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's feedback history
// @route   GET /api/feedback/my-feedback
// @access  Private
const getMyFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitFeedback,
    getMyFeedback
};
