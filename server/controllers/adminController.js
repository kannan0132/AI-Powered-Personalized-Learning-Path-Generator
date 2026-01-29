const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Question = require('../models/Question');
const Assessment = require('../models/Assessment');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');
const Feedback = require('../models/Feedback');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalCourses,
            totalLessons,
            totalQuestions,
            totalCertificates,
            recentUsers,
            recentAssessments
        ] = await Promise.all([
            User.countDocuments(),
            Course.countDocuments(),
            Lesson.countDocuments(),
            Question.countDocuments(),
            Certificate.countDocuments(),
            User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt role'),
            Assessment.find().sort({ completedAt: -1 }).limit(5)
                .populate('user', 'name email')
        ]);

        // Get users by role
        const studentCount = await User.countDocuments({ role: 'Student' });
        const adminCount = await User.countDocuments({ role: 'Admin' });

        // Get published vs draft courses
        const publishedCourses = await Course.countDocuments({ isPublished: true });

        // Get completion stats
        const completedProgress = await Progress.countDocuments({ status: 'completed' });

        res.json({
            users: {
                total: totalUsers,
                students: studentCount,
                admins: adminCount
            },
            content: {
                courses: totalCourses,
                publishedCourses,
                lessons: totalLessons,
                questions: totalQuestions
            },
            achievements: {
                certificates: totalCertificates,
                lessonsCompleted: completedProgress
            },
            recent: {
                users: recentUsers,
                assessments: recentAssessments
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role } = req.query;

        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) query.role = role;

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            users,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['Student', 'Admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Block user
// @route   PUT /api/admin/users/:id/block
// @access  Admin
const blockUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot block your own account' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: true },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unblock user
// @route   PUT /api/admin/users/:id/unblock
// @access  Admin
const unblockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: false },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
    try {
        // Don't allow deleting self
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Clean up related data
        await Promise.all([
            Progress.deleteMany({ user: req.params.id }),
            Assessment.deleteMany({ user: req.params.id }),
            Certificate.deleteMany({ user: req.params.id })
        ]);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all questions
// @route   GET /api/admin/questions
// @access  Admin
const getQuestions = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, difficulty } = req.query;

        let query = {};
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;

        const questions = await Question.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Question.countDocuments(query);
        const categories = await Question.distinct('category');

        res.json({
            questions,
            categories,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create question
// @route   POST /api/admin/questions
// @access  Admin
const createQuestion = async (req, res) => {
    try {
        const question = await Question.create(req.body);
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update question
// @route   PUT /api/admin/questions/:id
// @access  Admin
const updateQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete question
// @route   DELETE /api/admin/questions/:id
// @access  Admin
const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create course
// @route   POST /api/admin/courses
// @access  Admin
const createCourse = async (req, res) => {
    try {
        const course = await Course.create({
            ...req.body,
            createdBy: req.user.id
        });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update course
// @route   PUT /api/admin/courses/:id
// @access  Admin
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/admin/courses/:id
// @access  Admin
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Delete associated lessons
        await Lesson.deleteMany({ course: req.params.id });

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all feedback
// @route   GET /api/admin/feedback
// @access  Admin
const getAllFeedback = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, type } = req.query;

        let query = {};
        if (status) query.status = status;
        if (type) query.type = type;

        const feedback = await Feedback.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Feedback.countDocuments(query);

        res.json({
            feedback,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Respond to feedback
// @route   PUT /api/admin/feedback/:id
// @access  Admin
const respondToFeedback = async (req, res) => {
    try {
        const { status, response } = req.body;

        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            {
                status,
                response,
                resolvedAt: status === 'resolved' ? new Date() : null
            },
            { new: true }
        );

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Admin
const getSystemSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne().sort({ updatedAt: -1 });
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Admin
const updateSystemSettings = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            {},
            { ...req.body, updatedAt: Date.now(), updatedBy: req.user.id },
            { new: true, upsert: true }
        );
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res) => {
    console.log('Admin login attempt for:', req.body.email);
    const { email, password, adminKey } = req.body;

    // Verify admin key first
    if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ message: 'Invalid Admin Security Key' });
    }

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.role !== 'Admin') {
                return res.status(403).json({ message: 'Access denied. Admin role required.' });
            }

            if (user.isBlocked) {
                console.log('Admin login failed: Account blocked for', req.body.email);
                return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
            }

            // Token generation
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', {
                expiresIn: '30d'
            });

            console.log('Admin login successful for:', req.body.email);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};
