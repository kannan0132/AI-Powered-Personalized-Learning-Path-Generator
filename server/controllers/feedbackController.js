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

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback/admin
// @access  Private/Admin
const getAdminFeedback = async (req, res) => {
    try {
        const { status, type, priority } = req.query;
        const query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        if (priority) query.priority = priority;

        const feedback = await Feedback.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update feedback status/response (Admin)
// @route   PUT /api/feedback/:id
// @access  Private/Admin
const updateFeedbackStatus = async (req, res) => {
    try {
        const { status, response } = req.body;
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        feedback.status = status || feedback.status;
        feedback.response = response || feedback.response;
        if (status === 'resolved') {
            feedback.resolvedAt = Date.now();
        }

        const updatedFeedback = await feedback.save();
        res.json(updatedFeedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitFeedback,
    getMyFeedback,
    getAdminFeedback,
    updateFeedbackStatus
};
