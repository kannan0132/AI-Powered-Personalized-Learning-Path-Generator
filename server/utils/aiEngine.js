/**
 * AI Engine for Personalized Learning Path Generation
 * 
 * This module contains the core AI logic for:
 * - Generating personalized learning paths
 * - Making course/lesson recommendations
 * - Analyzing skill gaps
 * - Dynamic path adjustments
 */

const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const LearningPath = require('../models/LearningPath');
const Recommendation = require('../models/Recommendation');

/**
 * Generate a personalized learning path based on user profile and assessments
 */
const generateLearningPath = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        // Get user's latest assessment
        const latestAssessment = await Assessment.findOne({ user: userId })
            .sort({ createdAt: -1 });

        // Get user preferences
        const { skillLevel, preferredTopics, learningGoals, timeAvailability } = user;

        // Analyze weak areas from assessment
        let weakTopics = [];
        let strongTopics = [];

        if (latestAssessment && latestAssessment.skillGapAnalysis) {
            weakTopics = latestAssessment.skillGapAnalysis.weakTopics || [];
            strongTopics = latestAssessment.skillGapAnalysis.strongTopics || [];
        }

        // Build query for recommended courses
        const difficultyMap = {
            'Beginner': ['Beginner'],
            'Intermediate': ['Beginner', 'Intermediate'],
            'Advanced': ['Intermediate', 'Advanced']
        };

        const targetDifficulties = difficultyMap[skillLevel] || ['Beginner'];

        // Find relevant courses prioritizing weak areas and user interests
        const allCourses = await Course.find({
            isPublished: true,
            difficulty: { $in: targetDifficulties }
        }).populate('lessons', '_id');

        // Score and rank courses based on relevance
        const scoredCourses = allCourses.map(course => {
            let score = 0;

            // Prioritize courses in preferred topics
            if (preferredTopics && preferredTopics.includes(course.category)) {
                score += 30;
            }

            // Prioritize courses that address weak areas
            if (weakTopics.length > 0) {
                const courseAddressesWeakness = course.tags?.some(tag =>
                    weakTopics.some(weak => weak.toLowerCase().includes(tag.toLowerCase()))
                );
                if (courseAddressesWeakness) {
                    score += 40;
                }
            }

            // Match difficulty level
            if (course.difficulty === skillLevel) {
                score += 20;
            }

            // Consider course rating
            score += course.rating * 2;

            // Consider popularity
            score += Math.min(course.enrolledCount / 10, 10);

            return { course, score };
        });

        // Sort by score and take top courses based on time availability
        scoredCourses.sort((a, b) => b.score - a.score);

        const coursesPerWeek = timeAvailability === 'Full-time' ? 3 :
            timeAvailability === 'Part-time' ? 2 : 1;

        const recommendedCourses = scoredCourses
            .slice(0, Math.max(4, coursesPerWeek * 4))
            .map((item, index) => ({
                course: item.course._id,
                order: index + 1,
                status: index === 0 ? 'in_progress' : 'not_started',
                progress: 0
            }));

        // Calculate estimated duration
        const totalLessons = scoredCourses
            .slice(0, recommendedCourses.length)
            .reduce((acc, item) => acc + (item.course.lessons?.length || 0), 0);

        const hoursPerWeek = timeAvailability === 'Full-time' ? 40 :
            timeAvailability === 'Part-time' ? 20 : 10;

        const estimatedWeeks = Math.ceil((totalLessons * 0.5) / hoursPerWeek);

        // Create the learning path
        const learningPath = await LearningPath.create({
            user: userId,
            title: `${skillLevel} ${preferredTopics?.[0] || 'General'} Learning Path`,
            description: `Personalized learning path generated based on your ${skillLevel} skill level, focusing on ${preferredTopics?.join(', ') || 'various topics'}.`,
            type: 'skill-based',
            difficulty: skillLevel,
            targetGoal: learningGoals || 'Skill improvement',
            estimatedDuration: `${estimatedWeeks} weeks`,
            totalHours: totalLessons * 0.5,
            courses: recommendedCourses,
            focusAreas: preferredTopics || [],
            weakTopics,
            strongTopics,
            generatedBy: 'ai'
        });

        // Populate course details before returning
        await learningPath.populate('courses.course', 'title description difficulty category');

        return learningPath;
    } catch (error) {
        console.error('Error generating learning path:', error);
        throw error;
    }
};

/**
 * Get next recommended action for a user
 */
const getNextRecommendation = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        // Check for existing pending recommendations
        const existingRec = await Recommendation.findOne({
            user: userId,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        }).sort({ priority: -1 });

        if (existingRec) {
            return existingRec;
        }

        // Get user's active learning path
        const activePath = await LearningPath.findOne({
            user: userId,
            status: 'active'
        }).populate('courses.course');

        if (activePath && activePath.courses.length > 0) {
            // Find the current course (first non-completed)
            const currentCourse = activePath.courses.find(c => c.status !== 'completed');

            if (currentCourse && currentCourse.course) {
                // Get next incomplete lesson
                const lessons = await Lesson.find({ course: currentCourse.course._id })
                    .sort({ order: 1 });

                if (lessons.length > 0) {
                    const recommendation = await Recommendation.create({
                        user: userId,
                        type: 'next_lesson',
                        title: `Continue: ${lessons[0].title}`,
                        description: lessons[0].description,
                        reason: `Continue your progress in ${currentCourse.course.title}`,
                        priority: 8,
                        targetId: lessons[0]._id,
                        targetModel: 'Lesson',
                        metadata: {
                            difficulty: lessons[0].difficulty,
                            category: currentCourse.course.category,
                            estimatedTime: lessons[0].duration
                        }
                    });
                    return recommendation;
                }
            }
        }

        // If no active path, recommend taking an assessment
        const latestAssessment = await Assessment.findOne({ user: userId })
            .sort({ createdAt: -1 });

        if (!latestAssessment ||
            (Date.now() - latestAssessment.createdAt.getTime()) > 7 * 24 * 60 * 60 * 1000) {
            return await Recommendation.create({
                user: userId,
                type: 'skill_gap',
                title: 'Take a Skill Assessment',
                description: 'Complete a skill assessment to get personalized course recommendations',
                reason: latestAssessment
                    ? 'Your last assessment was over a week ago'
                    : 'Start with an assessment to evaluate your current skills',
                priority: 9,
                targetModel: 'Assessment'
            });
        }

        // Recommend a new course
        const recommendedCourse = await Course.findOne({
            isPublished: true,
            difficulty: user.skillLevel,
            category: { $in: user.preferredTopics || [] }
        });

        if (recommendedCourse) {
            return await Recommendation.create({
                user: userId,
                type: 'new_course',
                title: `Start: ${recommendedCourse.title}`,
                description: recommendedCourse.description,
                reason: `This course matches your ${user.skillLevel} level and interests`,
                priority: 7,
                targetId: recommendedCourse._id,
                targetModel: 'Course',
                metadata: {
                    difficulty: recommendedCourse.difficulty,
                    category: recommendedCourse.category
                }
            });
        }

        return null;
    } catch (error) {
        console.error('Error getting recommendation:', error);
        throw error;
    }
};

/**
 * Update learning path based on new progress
 */
const updatePathOnProgress = async (userId, lessonId, status) => {
    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) throw new Error('Lesson not found');

        const activePath = await LearningPath.findOne({
            user: userId,
            status: 'active',
            'courses.course': lesson.course
        });

        if (!activePath) return null;

        // Update course progress in the path
        const courseIndex = activePath.courses.findIndex(
            c => c.course.toString() === lesson.course.toString()
        );

        if (courseIndex !== -1) {
            // Get all lessons for this course
            const allLessons = await Lesson.find({ course: lesson.course });

            // Calculate progress (simplified - in real app, track individual lessons)
            const newProgress = Math.min(
                activePath.courses[courseIndex].progress + (100 / allLessons.length),
                100
            );

            activePath.courses[courseIndex].progress = newProgress;

            if (newProgress >= 100) {
                activePath.courses[courseIndex].status = 'completed';
                activePath.courses[courseIndex].completedAt = new Date();

                // Start next course
                if (courseIndex + 1 < activePath.courses.length) {
                    activePath.courses[courseIndex + 1].status = 'in_progress';
                    activePath.courses[courseIndex + 1].startedAt = new Date();
                }
            }

            await activePath.save();

            // Generate completion recommendation if course completed
            if (newProgress >= 100) {
                await Recommendation.create({
                    user: userId,
                    type: 'milestone',
                    title: 'Course Completed! 🎉',
                    description: `Great job completing the course!`,
                    reason: 'Celebrate your achievement and continue learning',
                    priority: 6
                });
            }
        }

        return activePath;
    } catch (error) {
        console.error('Error updating path on progress:', error);
        throw error;
    }
};

/**
 * Get practice recommendations for weak topics
 */
const getPracticeRecommendations = async (userId) => {
    try {
        const latestAssessment = await Assessment.findOne({ user: userId })
            .sort({ createdAt: -1 });

        if (!latestAssessment || !latestAssessment.skillGapAnalysis?.weakTopics) {
            return [];
        }

        const weakTopics = latestAssessment.skillGapAnalysis.weakTopics;
        const recommendations = [];

        for (const topic of weakTopics.slice(0, 3)) {
            const course = await Course.findOne({
                isPublished: true,
                $or: [
                    { tags: { $regex: topic, $options: 'i' } },
                    { category: { $regex: topic, $options: 'i' } }
                ]
            });

            if (course) {
                recommendations.push({
                    type: 'practice',
                    topic,
                    course: {
                        _id: course._id,
                        title: course.title,
                        difficulty: course.difficulty
                    },
                    reason: `Strengthen your ${topic} skills`
                });
            }
        }

        return recommendations;
    } catch (error) {
        console.error('Error getting practice recommendations:', error);
        throw error;
    }
};

module.exports = {
    generateLearningPath,
    getNextRecommendation,
    updatePathOnProgress,
    getPracticeRecommendations
};
