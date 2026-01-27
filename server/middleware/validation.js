const { body, param, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// User registration validation
const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain at least one number'),
    handleValidationErrors
];

// User login validation  
const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
    body('skillLevel')
        .optional()
        .isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid skill level'),
    body('learningGoals')
        .optional()
        .isArray().withMessage('Learning goals must be an array'),
    body('preferredTopics')
        .optional()
        .isArray().withMessage('Preferred topics must be an array'),
    body('weeklyTimeCommitment')
        .optional()
        .isInt({ min: 1, max: 168 }).withMessage('Weekly time must be 1-168 hours'),
    handleValidationErrors
];

// Course validation
const validateCourse = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('category')
        .notEmpty().withMessage('Category is required'),
    body('difficulty')
        .isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid difficulty'),
    handleValidationErrors
];

// Question validation
const validateQuestion = [
    body('text')
        .trim()
        .notEmpty().withMessage('Question text is required')
        .isLength({ min: 5, max: 1000 }).withMessage('Question must be 5-1000 characters'),
    body('options')
        .isArray({ min: 2, max: 6 }).withMessage('Must have 2-6 options'),
    body('correctAnswer')
        .isInt({ min: 0 }).withMessage('Correct answer index is required'),
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required'),
    body('difficulty')
        .isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid difficulty'),
    handleValidationErrors
];

// Feedback validation
const validateFeedback = [
    body('type')
        .isIn(['feedback', 'bug', 'feature', 'support']).withMessage('Invalid feedback type'),
    body('subject')
        .trim()
        .notEmpty().withMessage('Subject is required')
        .isLength({ max: 200 }).withMessage('Subject must be under 200 characters'),
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ max: 2000 }).withMessage('Message must be under 2000 characters'),
    handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
    param(paramName)
        .isMongoId().withMessage(`Invalid ${paramName}`),
    handleValidationErrors
];

// Sanitize input to prevent NoSQL injection
const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                if (key.startsWith('$')) {
                    delete obj[key];
                } else if (typeof obj[key] === 'object') {
                    sanitize(obj[key]);
                }
            }
        }
    };

    sanitize(req.body);
    sanitize(req.query);
    sanitize(req.params);
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateProfileUpdate,
    validateCourse,
    validateQuestion,
    validateFeedback,
    validateObjectId,
    sanitizeInput,
    handleValidationErrors
};
