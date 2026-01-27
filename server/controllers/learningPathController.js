const LearningPath = require('../models/LearningPath');
const Recommendation = require('../models/Recommendation');
const {
    generateLearningPath,
    getNextRecommendation,
    updatePathOnProgress,
    getPracticeRecommendations
} = require('../utils/aiEngine');

// @desc    Generate a new learning path
// @route   POST /api/learning-path/generate
// @access  Private
const createLearningPath = async (req, res) => {
    try {
        // Check if user already has an active learning path
        const existingPath = await LearningPath.findOne({
            user: req.user.id,
            status: 'active'
        });

        if (existingPath) {
            // Pause the existing path
            existingPath.status = 'paused';
            await existingPath.save();
        }

        const learningPath = await generateLearningPath(req.user.id);
        res.status(201).json(learningPath);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's active learning path
// @route   GET /api/learning-path/active
// @access  Private
const getActivePath = async (req, res) => {
    try {
        const learningPath = await LearningPath.findOne({
            user: req.user.id,
            status: 'active'
        }).populate('courses.course', 'title description difficulty category thumbnail totalLessons');

        if (!learningPath) {
            return res.status(404).json({ message: 'No active learning path found' });
        }

        res.json(learningPath);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all user's learning paths
// @route   GET /api/learning-path
// @access  Private
const getAllPaths = async (req, res) => {
    try {
        const paths = await LearningPath.find({ user: req.user.id })
            .populate('courses.course', 'title difficulty category')
            .sort({ createdAt: -1 });

        res.json(paths);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get learning path by ID
// @route   GET /api/learning-path/:id
// @access  Private
const getPathById = async (req, res) => {
    try {
        const learningPath = await LearningPath.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate('courses.course', 'title description difficulty category thumbnail totalLessons duration');

        if (!learningPath) {
            return res.status(404).json({ message: 'Learning path not found' });
        }

        res.json(learningPath);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update learning path status
// @route   PUT /api/learning-path/:id/status
// @access  Private
const updatePathStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const learningPath = await LearningPath.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!learningPath) {
            return res.status(404).json({ message: 'Learning path not found' });
        }

        learningPath.status = status;
        await learningPath.save();

        res.json(learningPath);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get AI recommendations
// @route   GET /api/learning-path/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
    try {
        // Get next action recommendation
        const nextAction = await getNextRecommendation(req.user.id);

        // Get practice recommendations
        const practiceRecs = await getPracticeRecommendations(req.user.id);

        // Get recent recommendations
        const recentRecs = await Recommendation.find({
            user: req.user.id,
            status: { $in: ['pending', 'viewed'] },
            expiresAt: { $gt: new Date() }
        })
            .sort({ priority: -1, createdAt: -1 })
            .limit(5);

        res.json({
            nextAction,
            practiceRecommendations: practiceRecs,
            recentRecommendations: recentRecs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark recommendation as acted/dismissed
// @route   PUT /api/learning-path/recommendations/:id
// @access  Private
const updateRecommendation = async (req, res) => {
    try {
        const { status } = req.body;

        const recommendation = await Recommendation.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            {
                status,
                actionedAt: status === 'acted' ? new Date() : undefined
            },
            { new: true }
        );

        if (!recommendation) {
            return res.status(404).json({ message: 'Recommendation not found' });
        }

        res.json(recommendation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update course progress in learning path
// @route   PUT /api/learning-path/progress
// @access  Private
const updateProgress = async (req, res) => {
    try {
        const { lessonId, status } = req.body;

        const updatedPath = await updatePathOnProgress(req.user.id, lessonId, status);

        if (!updatedPath) {
            return res.status(404).json({ message: 'Learning path not found' });
        }

        res.json(updatedPath);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createLearningPath,
    getActivePath,
    getAllPaths,
    getPathById,
    updatePathStatus,
    getRecommendations,
    updateRecommendation,
    updateProgress
};
