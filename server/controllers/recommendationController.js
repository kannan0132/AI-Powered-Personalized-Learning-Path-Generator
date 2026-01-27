const Recommendation = require('../models/Recommendation');
const Progress = require('../models/Progress');
const Assessment = require('../models/Assessment');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Question = require('../models/Question');
const LearningPath = require('../models/LearningPath');

// @desc    Get all active recommendations for user
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
    try {
        const recommendations = await Recommendation.find({
            user: req.user.id,
            status: { $in: ['pending', 'viewed'] },
            expiresAt: { $gt: new Date() }
        })
            .populate('targetId')
            .sort({ priority: -1, createdAt: -1 })
            .limit(10);

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get next best lesson recommendation
// @route   GET /api/recommendations/next-lesson
// @access  Private
const getNextBestLesson = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's learning path
        const learningPath = await LearningPath.findOne({ user: userId })
            .populate({
                path: 'courses.course',
                populate: { path: 'lessons' }
            });

        // Get user's completed lessons
        const completedProgress = await Progress.find({
            user: userId,
            status: 'completed'
        }).select('lesson course');

        const completedLessonIds = completedProgress.map(p => p.lesson.toString());

        // Get in-progress lessons
        const inProgressLessons = await Progress.find({
            user: userId,
            status: 'in_progress'
        }).populate('lesson course').sort({ lastAccessedAt: -1 });

        // Priority 1: Continue in-progress lesson
        if (inProgressLessons.length > 0) {
            const lesson = inProgressLessons[0].lesson;
            const recommendation = await createOrUpdateRecommendation(userId, {
                type: 'next_lesson',
                title: `Continue: ${lesson.title}`,
                description: `You're ${inProgressLessons[0].progressPercent}% through this lesson`,
                reason: 'Continue where you left off',
                priority: 10,
                targetId: lesson._id,
                targetModel: 'Lesson',
                metadata: {
                    estimatedTime: lesson.duration,
                    category: 'continuation'
                }
            });

            return res.json({
                recommendation,
                lesson: lesson,
                type: 'continue'
            });
        }

        // Priority 2: Next lesson in current course path
        if (learningPath && learningPath.courses.length > 0) {
            for (const pathCourse of learningPath.courses) {
                if (!pathCourse.course) continue;

                const courseLessons = await Lesson.find({ course: pathCourse.course._id })
                    .sort({ order: 1 });

                for (const lesson of courseLessons) {
                    if (!completedLessonIds.includes(lesson._id.toString())) {
                        const recommendation = await createOrUpdateRecommendation(userId, {
                            type: 'next_lesson',
                            title: lesson.title,
                            description: `Next in your learning path: ${pathCourse.course.title}`,
                            reason: 'Following your personalized learning path',
                            priority: 9,
                            targetId: lesson._id,
                            targetModel: 'Lesson',
                            metadata: {
                                estimatedTime: lesson.duration,
                                category: pathCourse.course.category,
                                difficulty: lesson.difficulty
                            }
                        });

                        return res.json({
                            recommendation,
                            lesson,
                            course: pathCourse.course,
                            type: 'path_next'
                        });
                    }
                }
            }
        }

        // Priority 3: Suggest new course based on user's interests
        const user = await require('../models/User').findById(userId);
        const newCourse = await Course.findOne({
            category: { $in: user.preferredTopics },
            difficulty: user.skillLevel,
            isPublished: true,
            _id: { $nin: completedProgress.map(p => p.course) }
        }).populate('lessons');

        if (newCourse && newCourse.lessons.length > 0) {
            const firstLesson = newCourse.lessons[0];
            const recommendation = await createOrUpdateRecommendation(userId, {
                type: 'new_course',
                title: `Start: ${newCourse.title}`,
                description: `A ${newCourse.difficulty} course matching your interests`,
                reason: `Matches your preferred topics: ${user.preferredTopics.join(', ')}`,
                priority: 7,
                targetId: newCourse._id,
                targetModel: 'Course',
                metadata: {
                    estimatedTime: newCourse.duration,
                    category: newCourse.category,
                    difficulty: newCourse.difficulty
                }
            });

            return res.json({
                recommendation,
                course: newCourse,
                lesson: firstLesson,
                type: 'new_course'
            });
        }

        res.json({ message: 'No recommendations available', recommendation: null });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get revision suggestions based on time and performance
// @route   GET /api/recommendations/revision
// @access  Private
const getRevisionSuggestions = async (req, res) => {
    try {
        const userId = req.user.id;
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        // Get completed lessons that were accessed more than a week ago
        const oldProgress = await Progress.find({
            user: userId,
            status: 'completed',
            completedAt: { $lt: oneWeekAgo }
        }).populate('lesson course');

        // Get assessments to find weak areas
        const assessments = await Assessment.find({ user: userId })
            .sort({ completedAt: -1 })
            .limit(5);

        const weakCategories = new Set();
        assessments.forEach(assessment => {
            if (assessment.categoryScores) {
                assessment.categoryScores.forEach(cs => {
                    if (cs.percentage < 60) {
                        weakCategories.add(cs.category);
                    }
                });
            }
            if (assessment.skillGapAnalysis?.weakTopics) {
                assessment.skillGapAnalysis.weakTopics.forEach(t => weakCategories.add(t));
            }
        });

        const revisionSuggestions = [];

        // Prioritize lessons in weak categories
        for (const progress of oldProgress) {
            if (!progress.lesson) continue;

            const lessonCategory = progress.course?.category;
            const isWeakArea = weakCategories.has(lessonCategory);
            const daysSinceCompletion = Math.floor(
                (Date.now() - new Date(progress.completedAt).getTime()) / (1000 * 60 * 60 * 24)
            );

            const priority = isWeakArea ? 8 : (daysSinceCompletion > 14 ? 6 : 5);

            const recommendation = await createOrUpdateRecommendation(userId, {
                type: 'revision',
                title: `Review: ${progress.lesson.title}`,
                description: isWeakArea
                    ? `This topic appeared challenging in your assessments`
                    : `It's been ${daysSinceCompletion} days since you studied this`,
                reason: isWeakArea
                    ? 'Strengthen your understanding of this topic'
                    : 'Spaced repetition helps long-term retention',
                priority,
                targetId: progress.lesson._id,
                targetModel: 'Lesson',
                metadata: {
                    category: lessonCategory,
                    daysSinceCompletion,
                    isWeakArea
                }
            });

            revisionSuggestions.push({
                recommendation,
                lesson: progress.lesson,
                course: progress.course,
                daysSinceCompletion,
                isWeakArea
            });

            if (revisionSuggestions.length >= 5) break;
        }

        res.json({
            suggestions: revisionSuggestions,
            weakCategories: Array.from(weakCategories)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get weak-area practice questions
// @route   GET /api/recommendations/practice
// @access  Private
const getWeakAreaPractice = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 10 } = req.query;

        // Get recent assessments
        const assessments = await Assessment.find({ user: userId })
            .sort({ completedAt: -1 })
            .limit(5);

        // Identify weak topics
        const weakTopics = new Set();
        const incorrectQuestionIds = [];

        assessments.forEach(assessment => {
            if (assessment.skillGapAnalysis?.weakTopics) {
                assessment.skillGapAnalysis.weakTopics.forEach(t => weakTopics.add(t));
            }
            assessment.answers?.forEach(answer => {
                if (!answer.isCorrect && answer.questionId) {
                    incorrectQuestionIds.push(answer.questionId);
                    if (answer.category) weakTopics.add(answer.category);
                }
            });
        });

        // Find practice questions
        let questions = await Question.find({
            $or: [
                { category: { $in: Array.from(weakTopics) } },
                { tags: { $in: Array.from(weakTopics) } }
            ],
            _id: { $nin: incorrectQuestionIds.slice(0, 20) } // Exclude recently missed
        }).limit(parseInt(limit));

        // If not enough questions, add some from missed questions
        if (questions.length < limit) {
            const additionalQuestions = await Question.find({
                _id: { $in: incorrectQuestionIds }
            }).limit(limit - questions.length);
            questions = [...questions, ...additionalQuestions];
        }

        // Create practice recommendation
        if (questions.length > 0) {
            await createOrUpdateRecommendation(userId, {
                type: 'practice',
                title: 'Practice Session Available',
                description: `${questions.length} questions targeting your weak areas`,
                reason: `Focus on: ${Array.from(weakTopics).slice(0, 3).join(', ')}`,
                priority: 7,
                metadata: {
                    questionCount: questions.length,
                    weakTopics: Array.from(weakTopics)
                }
            });
        }

        res.json({
            questions: questions.map(q => ({
                _id: q._id,
                text: q.text,
                options: q.options,
                category: q.category,
                difficulty: q.difficulty,
                timeLimit: q.timeLimit
            })),
            weakTopics: Array.from(weakTopics),
            totalQuestions: questions.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark recommendation as acted/dismissed
// @route   PUT /api/recommendations/:id/action
// @access  Private
const updateRecommendationStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'acted' or 'dismissed'

        const recommendation = await Recommendation.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            {
                status,
                actionedAt: new Date()
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

// Helper function to create or update recommendation
const createOrUpdateRecommendation = async (userId, data) => {
    const existing = await Recommendation.findOne({
        user: userId,
        type: data.type,
        targetId: data.targetId,
        status: { $in: ['pending', 'viewed'] }
    });

    if (existing) {
        existing.priority = data.priority;
        existing.reason = data.reason;
        existing.metadata = data.metadata;
        existing.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return await existing.save();
    }

    return await Recommendation.create({
        user: userId,
        ...data
    });
};

// @desc    Trigger recommendations (called after lesson/assessment completion)
// @access  Internal
const triggerRecommendations = async (userId, triggerType, metadata = {}) => {
    try {
        switch (triggerType) {
            case 'lesson_completed':
                // Check if course is almost complete for milestone
                const courseProgress = await Progress.find({
                    user: userId,
                    course: metadata.courseId,
                    status: 'completed'
                });
                const courseLessons = await Lesson.countDocuments({ course: metadata.courseId });

                if (courseProgress.length === courseLessons - 1) {
                    const course = await Course.findById(metadata.courseId);
                    await createOrUpdateRecommendation(userId, {
                        type: 'milestone',
                        title: `Almost there! Complete ${course.title}`,
                        description: 'Just one lesson left to complete this course',
                        reason: 'Finish strong and earn your certificate!',
                        priority: 10,
                        targetId: metadata.courseId,
                        targetModel: 'Course'
                    });
                }
                break;

            case 'assessment_completed':
                // Generate practice recommendations for weak areas
                const assessment = await Assessment.findById(metadata.assessmentId);
                if (assessment?.skillGapAnalysis?.weakTopics?.length > 0) {
                    await createOrUpdateRecommendation(userId, {
                        type: 'skill_gap',
                        title: 'Skill Gap Detected',
                        description: `Focus areas: ${assessment.skillGapAnalysis.weakTopics.join(', ')}`,
                        reason: 'Practice these topics to improve your performance',
                        priority: 8,
                        metadata: {
                            weakTopics: assessment.skillGapAnalysis.weakTopics,
                            assessmentScore: assessment.percentage
                        }
                    });
                }
                break;

            case 'user_return':
                // User returning after inactivity
                const lastActivity = await Progress.findOne({ user: userId })
                    .sort({ lastAccessedAt: -1 });

                if (lastActivity && lastActivity.status === 'in_progress') {
                    await createOrUpdateRecommendation(userId, {
                        type: 'next_lesson',
                        title: 'Welcome Back!',
                        description: `Continue: ${lastActivity.lesson?.title || 'your lesson'}`,
                        reason: 'Pick up where you left off',
                        priority: 10,
                        targetId: lastActivity.lesson,
                        targetModel: 'Lesson'
                    });
                }
                break;
        }
    } catch (error) {
        console.error('Error triggering recommendations:', error);
    }
};

module.exports = {
    getRecommendations,
    getNextBestLesson,
    getRevisionSuggestions,
    getWeakAreaPractice,
    updateRecommendationStatus,
    triggerRecommendations
};
