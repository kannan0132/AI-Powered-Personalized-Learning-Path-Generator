const Progress = require('../models/Progress');
const ActivityLog = require('../models/ActivityLog');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

// @desc    Get user's overall progress stats
// @route   GET /api/progress/stats
// @access  Private
const getProgressStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all user's progress records
        const allProgress = await Progress.find({ user: userId });

        // Calculate completed lessons
        const completedLessons = allProgress.filter(p => p.status === 'completed').length;
        const inProgressLessons = allProgress.filter(p => p.status === 'in_progress').length;

        // Calculate total time spent
        const totalTimeSpent = allProgress.reduce((acc, p) => acc + (p.timeSpent || 0), 0);

        // Get unique courses
        const courseIds = [...new Set(allProgress.map(p => p.course.toString()))];

        // Calculate course completion
        const courseProgress = await Promise.all(courseIds.map(async (courseId) => {
            const course = await Course.findById(courseId);
            const courseLessons = await Lesson.countDocuments({ course: courseId });
            const completedCourseLessons = allProgress.filter(
                p => p.course.toString() === courseId && p.status === 'completed'
            ).length;

            return {
                courseId,
                title: course?.title,
                progress: courseLessons > 0 ? Math.round((completedCourseLessons / courseLessons) * 100) : 0,
                completed: completedCourseLessons === courseLessons
            };
        }));

        const completedCourses = courseProgress.filter(c => c.completed).length;

        // Calculate learning streak
        const streak = await calculateStreak(userId);

        res.json({
            lessonsCompleted: completedLessons,
            lessonsInProgress: inProgressLessons,
            coursesEnrolled: courseIds.length,
            coursesCompleted: completedCourses,
            totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
            currentStreak: streak.current,
            longestStreak: streak.longest,
            courseProgress
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get progress for a specific course
// @route   GET /api/progress/course/:courseId
// @access  Private
const getCourseProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;

        const progress = await Progress.find({
            user: userId,
            course: courseId
        }).populate('lesson', 'title order duration');

        const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

        const lessonProgress = lessons.map(lesson => {
            const p = progress.find(prog => prog.lesson.toString() === lesson._id.toString());
            return {
                lessonId: lesson._id,
                title: lesson.title,
                order: lesson.order,
                duration: lesson.duration,
                status: p?.status || 'not_started',
                progressPercent: p?.progressPercent || 0,
                timeSpent: p?.timeSpent || 0,
                completedAt: p?.completedAt
            };
        });

        const completedCount = lessonProgress.filter(l => l.status === 'completed').length;

        res.json({
            courseId,
            totalLessons: lessons.length,
            completedLessons: completedCount,
            overallProgress: lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0,
            lessons: lessonProgress
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update lesson progress
// @route   PUT /api/progress/lesson/:lessonId
// @access  Private
const updateLessonProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { lessonId } = req.params;
        const { status, progressPercent, timeSpent } = req.body;

        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        let progress = await Progress.findOne({
            user: userId,
            lesson: lessonId
        });

        if (!progress) {
            progress = new Progress({
                user: userId,
                course: lesson.course,
                lesson: lessonId,
                startedAt: new Date()
            });

            // Log activity
            await ActivityLog.create({
                user: userId,
                action: 'lesson_started',
                details: {
                    targetId: lessonId,
                    targetType: 'Lesson',
                    title: lesson.title
                }
            });
        }

        if (status) progress.status = status;
        if (progressPercent !== undefined) progress.progressPercent = progressPercent;
        if (timeSpent) progress.timeSpent = (progress.timeSpent || 0) + timeSpent;

        if (status === 'completed' && !progress.completedAt) {
            progress.completedAt = new Date();
            progress.progressPercent = 100;

            // Log completion
            await ActivityLog.create({
                user: userId,
                action: 'lesson_completed',
                details: {
                    targetId: lessonId,
                    targetType: 'Lesson',
                    title: lesson.title,
                    duration: progress.timeSpent
                }
            });

            // Update streak
            await updateStreak(userId);

            // Trigger recommendations for course completion milestone
            const { triggerRecommendations } = require('./recommendationController');
            await triggerRecommendations(userId, 'lesson_completed', {
                courseId: lesson.course,
                lessonId
            });
        }

        await progress.save();

        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get activity timeline
// @route   GET /api/progress/activity
// @access  Private
const getActivityTimeline = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, page = 1 } = req.query;

        const activities = await ActivityLog.find({ user: userId })
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await ActivityLog.countDocuments({ user: userId });

        res.json({
            activities,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get weekly progress report
// @route   GET /api/progress/weekly
// @access  Private
const getWeeklyReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Get activities from past week
        const activities = await ActivityLog.find({
            user: userId,
            timestamp: { $gte: oneWeekAgo }
        });

        // Group by day
        const dailyActivity = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            dailyActivity[dateStr] = {
                date: dateStr,
                lessonsCompleted: 0,
                timeSpent: 0,
                assessmentsTaken: 0
            };
        }

        activities.forEach(activity => {
            const dateStr = activity.timestamp.toISOString().split('T')[0];
            if (dailyActivity[dateStr]) {
                if (activity.action === 'lesson_completed') {
                    dailyActivity[dateStr].lessonsCompleted++;
                    dailyActivity[dateStr].timeSpent += activity.details?.duration || 0;
                }
                if (activity.action === 'assessment_completed') {
                    dailyActivity[dateStr].assessmentsTaken++;
                }
            }
        });

        const report = Object.values(dailyActivity).reverse();

        res.json({
            weeklyData: report,
            summary: {
                totalLessons: report.reduce((acc, d) => acc + d.lessonsCompleted, 0),
                totalTime: Math.round(report.reduce((acc, d) => acc + d.timeSpent, 0) / 60),
                totalAssessments: report.reduce((acc, d) => acc + d.assessmentsTaken, 0)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to calculate streak
const calculateStreak = async (userId) => {
    const activities = await ActivityLog.find({
        user: userId,
        action: { $in: ['lesson_completed', 'assessment_completed'] }
    }).sort({ timestamp: -1 });

    if (activities.length === 0) {
        return { current: 0, longest: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = new Date(activities[0].timestamp).toDateString();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    // Check if streak is still active
    if (lastDate === today || lastDate === yesterday) {
        currentStreak = 1;
    }

    for (let i = 1; i < activities.length; i++) {
        const currentDate = new Date(activities[i].timestamp).toDateString();
        const prevDate = new Date(activities[i - 1].timestamp);
        const dayBefore = new Date(prevDate - 24 * 60 * 60 * 1000).toDateString();

        if (currentDate === dayBefore) {
            tempStreak++;
            if (lastDate === today || lastDate === yesterday) {
                currentStreak = tempStreak;
            }
        } else if (currentDate !== prevDate.toDateString()) {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }
    }

    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return { current: currentStreak, longest: longestStreak };
};

// Helper function to update streak
const updateStreak = async (userId) => {
    const streak = await calculateStreak(userId);

    // Update user's streak in their profile if needed
    await User.findByIdAndUpdate(userId, {
        $set: {
            currentStreak: streak.current,
            longestStreak: Math.max(streak.longest, streak.current)
        }
    });

    return streak;
};

module.exports = {
    getProgressStats,
    getCourseProgress,
    updateLessonProgress,
    getActivityTimeline,
    getWeeklyReport
};
