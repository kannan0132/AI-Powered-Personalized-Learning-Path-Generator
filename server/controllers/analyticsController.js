const Progress = require('../models/Progress');
const Assessment = require('../models/Assessment');
const Course = require('../models/Course');
const Certificate = require('../models/Certificate');

// @desc    Get user performance analytics
// @route   GET /api/analytics/performance
// @access  Private
const getPerformanceAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all assessments
        const assessments = await Assessment.find({ user: userId })
            .sort({ completedAt: 1 })
            .select('percentage completedAt skillGapAnalysis');

        // Get progress data
        const progress = await Progress.find({ user: userId })
            .populate('course', 'title category');

        // Calculate performance over time
        const performanceOverTime = assessments.map(a => ({
            date: a.completedAt,
            score: a.percentage
        }));

        // Calculate category-wise performance
        const categoryScores = {};
        assessments.forEach(a => {
            if (a.skillGapAnalysis?.weakTopics) {
                a.skillGapAnalysis.weakTopics.forEach(topic => {
                    categoryScores[topic] = (categoryScores[topic] || 0) - 1;
                });
            }
            if (a.skillGapAnalysis?.strongTopics) {
                a.skillGapAnalysis.strongTopics.forEach(topic => {
                    categoryScores[topic] = (categoryScores[topic] || 0) + 1;
                });
            }
        });

        // Learning pace calculation
        const completedLessons = progress.filter(p => p.status === 'completed');
        const totalTimeSpent = progress.reduce((acc, p) => acc + (p.timeSpent || 0), 0);
        const averageTimePerLesson = completedLessons.length > 0
            ? Math.round(totalTimeSpent / completedLessons.length)
            : 0;

        // Identify weak and strong areas
        const weakAreas = Object.entries(categoryScores)
            .filter(([_, score]) => score < 0)
            .sort((a, b) => a[1] - b[1])
            .slice(0, 5)
            .map(([topic, score]) => ({ topic, score: Math.abs(score) }));

        const strongAreas = Object.entries(categoryScores)
            .filter(([_, score]) => score > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([topic, score]) => ({ topic, score }));

        res.json({
            performanceOverTime,
            totalAssessments: assessments.length,
            averageScore: assessments.length > 0
                ? Math.round(assessments.reduce((acc, a) => acc + a.percentage, 0) / assessments.length)
                : 0,
            lessonsCompleted: completedLessons.length,
            totalTimeSpent: Math.round(totalTimeSpent / 60), // in minutes
            averageTimePerLesson,
            weakAreas,
            strongAreas
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get course popularity stats (admin)
// @route   GET /api/analytics/courses
// @access  Admin
const getCourseAnalytics = async (req, res) => {
    try {
        // Get enrollment counts per course
        const enrollments = await Progress.aggregate([
            { $group: { _id: '$course', enrollments: { $addToSet: '$user' } } },
            { $project: { course: '$_id', enrollmentCount: { $size: '$enrollments' } } }
        ]);

        // Get completion rates
        const completionData = await Progress.aggregate([
            {
                $group: {
                    _id: '$course',
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
                }
            },
            {
                $project: {
                    course: '$_id',
                    completionRate: { $multiply: [{ $divide: ['$completed', '$total'] }, 100] }
                }
            }
        ]);

        // Get certificate counts per course
        const certificates = await Certificate.aggregate([
            { $group: { _id: '$course', count: { $sum: 1 } } }
        ]);

        // Combine data with course info
        const courses = await Course.find().select('title category difficulty');

        const analytics = courses.map(course => {
            const enrollment = enrollments.find(e => e._id?.toString() === course._id.toString());
            const completion = completionData.find(c => c._id?.toString() === course._id.toString());
            const cert = certificates.find(c => c._id?.toString() === course._id.toString());

            return {
                course: { _id: course._id, title: course.title, category: course.category },
                enrollments: enrollment?.enrollmentCount || 0,
                completionRate: Math.round(completion?.completionRate || 0),
                certificates: cert?.count || 0
            };
        });

        res.json(analytics.sort((a, b) => b.enrollments - a.enrollments));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get difficult topics
// @route   GET /api/analytics/difficult-topics
// @access  Private
const getDifficultTopics = async (req, res) => {
    try {
        // Aggregate weak topics from all assessments
        const weakTopics = await Assessment.aggregate([
            { $unwind: '$skillGapAnalysis.weakTopics' },
            { $group: { _id: '$skillGapAnalysis.weakTopics', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json(weakTopics.map(t => ({ topic: t._id, frequency: t.count })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPerformanceAnalytics,
    getCourseAnalytics,
    getDifficultTopics
};
