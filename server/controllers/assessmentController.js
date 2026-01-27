const Question = require('../models/Question');
const Assessment = require('../models/Assessment');
const User = require('../models/User');

// @desc    Get random questions for assessment
// @route   GET /api/assessment/questions
// @access  Private
const getQuestions = async (req, res) => {
    try {
        const { category, difficulty, count = 10 } = req.query;
        const user = await User.findById(req.user.id);

        let query = {};

        // Filter by category if specified
        if (category && category !== 'all') {
            query.category = category;
        } else if (user.preferredTopics && user.preferredTopics.length > 0) {
            query.category = { $in: user.preferredTopics };
        }

        // Filter by difficulty if specified
        if (difficulty && difficulty !== 'all') {
            query.difficulty = difficulty;
        } else if (user.skillLevel) {
            query.difficulty = user.skillLevel;
        }

        // Get questions matching criteria
        let questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: parseInt(count) } }
        ]);

        // If not enough questions, get random ones
        if (questions.length < 5) {
            questions = await Question.aggregate([
                { $sample: { size: parseInt(count) } }
            ]);
        }

        // Don't send correct answers to client during quiz
        const sanitizedQuestions = questions.map(q => ({
            _id: q._id,
            text: q.text,
            options: q.options,
            category: q.category,
            difficulty: q.difficulty,
            points: q.points || 10,
            timeLimit: q.timeLimit || 30
        }));

        res.json(sanitizedQuestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit assessment and calculate score
// @route   POST /api/assessment/submit
// @access  Private
const submitAssessment = async (req, res) => {
    const { answers, totalTimeTaken } = req.body;
    // answers: Array of { questionId, answerIndex, timeTaken }

    try {
        let score = 0;
        let maxScore = 0;
        const categoryStats = {};
        const detailedAnswers = [];

        for (const ans of answers) {
            const question = await Question.findById(ans.questionId);
            if (!question) continue;

            const isCorrect = question.correctAnswer === ans.answerIndex;
            const points = question.points || 10;
            maxScore += points;

            if (isCorrect) {
                score += points;
            }

            // Track category statistics
            if (!categoryStats[question.category]) {
                categoryStats[question.category] = { correct: 0, total: 0 };
            }
            categoryStats[question.category].total++;
            if (isCorrect) {
                categoryStats[question.category].correct++;
            }

            // Store detailed answer
            detailedAnswers.push({
                questionId: question._id,
                questionText: question.text,
                selectedAnswer: ans.answerIndex,
                correctAnswer: question.correctAnswer,
                isCorrect,
                timeTaken: ans.timeTaken || 0,
                category: question.category
            });
        }

        // Calculate percentage
        const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

        // Build category scores array
        const categoryScores = Object.entries(categoryStats).map(([category, stats]) => ({
            category,
            correct: stats.correct,
            total: stats.total,
            percentage: Math.round((stats.correct / stats.total) * 100)
        }));

        // Determine weak and strong topics
        const weakTopics = categoryScores
            .filter(c => c.percentage < 50)
            .map(c => c.category);
        const strongTopics = categoryScores
            .filter(c => c.percentage >= 70)
            .map(c => c.category);

        // Determine overall difficulty of the assessment
        const difficulties = detailedAnswers.map(a => a.difficulty);
        let assessmentDifficulty = 'Mixed';
        if (difficulties.every(d => d === 'Beginner')) assessmentDifficulty = 'Beginner';
        else if (difficulties.every(d => d === 'Intermediate')) assessmentDifficulty = 'Intermediate';
        else if (difficulties.every(d => d === 'Advanced')) assessmentDifficulty = 'Advanced';

        const assessment = await Assessment.create({
            user: req.user.id,
            score,
            maxScore,
            percentage,
            totalQuestions: answers.length,
            difficulty: assessmentDifficulty,
            answers: detailedAnswers,
            categoryScores,
            skillGapAnalysis: {
                weakTopics,
                strongTopics
            },
            totalTimeTaken: totalTimeTaken || 0
        });

        // Trigger recommendations for weak areas
        const { triggerRecommendations } = require('./recommendationController');
        await triggerRecommendations(req.user.id, 'assessment_completed', { assessmentId: assessment._id });

        // Update user skill level based on performance
        const user = await User.findById(req.user.id);
        if (percentage >= 80) {
            if (user.skillLevel === 'Beginner') user.skillLevel = 'Intermediate';
            else if (user.skillLevel === 'Intermediate') user.skillLevel = 'Advanced';
            await user.save();
        } else if (percentage < 40 && user.skillLevel !== 'Beginner') {
            // Downgrade skill level if performing poorly
            if (user.skillLevel === 'Advanced') user.skillLevel = 'Intermediate';
            else if (user.skillLevel === 'Intermediate') user.skillLevel = 'Beginner';
            await user.save();
        }

        res.status(201).json(assessment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's assessment history
// @route   GET /api/assessment/history
// @access  Private
const getAssessmentHistory = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const assessments = await Assessment.find({ user: req.user.id })
            .sort({ completedAt: -1 })
            .limit(parseInt(limit))
            .select('-answers'); // Exclude detailed answers for performance

        res.json(assessments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single assessment details
// @route   GET /api/assessment/:id
// @access  Private
const getAssessmentById = async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        // Ensure user owns this assessment
        if (assessment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(assessment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available categories
// @route   GET /api/assessment/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Question.distinct('category');

        // Get count of questions per category and difficulty
        const categoryDetails = await Promise.all(
            categories.map(async (category) => {
                const count = await Question.countDocuments({ category });
                const difficulties = await Question.distinct('difficulty', { category });
                return { category, count, difficulties };
            })
        );

        res.json(categoryDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getQuestions,
    submitAssessment,
    getAssessmentHistory,
    getAssessmentById,
    getCategories
};
