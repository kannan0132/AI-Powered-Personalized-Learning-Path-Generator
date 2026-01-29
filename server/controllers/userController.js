const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d'
    });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, adminKey } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const role = adminKey === process.env.ADMIN_KEY ? 'Admin' : 'Student';

    const user = await User.create({
        name,
        email,
        password,
        role
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }
        user.skillLevel = req.body.skillLevel || user.skillLevel;
        user.learningGoals = req.body.learningGoals || user.learningGoals;
        user.preferredTopics = req.body.preferredTopics || user.preferredTopics;
        user.timeAvailability = req.body.timeAvailability || user.timeAvailability;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            skillLevel: updatedUser.skillLevel,
            learningGoals: updatedUser.learningGoals,
            preferredTopics: updatedUser.preferredTopics,
            timeAvailability: updatedUser.timeAvailability,
            token: generateToken(updatedUser._id, updatedUser.role)
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = { registerUser, authUser, updateUserProfile };
