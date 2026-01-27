const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

// @desc    Get all lessons for a course
// @route   GET /api/lessons/course/:courseId
// @access  Public
const getLessonsByCourse = async (req, res) => {
    try {
        const lessons = await Lesson.find({ course: req.params.courseId })
            .sort({ order: 1 })
            .select('-content'); // Exclude content for listing

        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single lesson with full content
// @route   GET /api/lessons/:id
// @access  Private
const getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id)
            .populate('course', 'title')
            .populate('topics', 'name');

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        res.json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create lesson
// @route   POST /api/lessons
// @access  Private/Admin
const createLesson = async (req, res) => {
    try {
        const { course, title, description, content, contentType, videoUrl, resources, order, duration, difficulty } = req.body;

        // Verify course exists
        const courseExists = await Course.findById(course);
        if (!courseExists) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const lesson = await Lesson.create({
            course,
            title,
            description,
            content,
            contentType: contentType || 'text',
            videoUrl,
            resources: resources || [],
            order: order || courseExists.lessons.length + 1,
            duration: duration || 10,
            difficulty: difficulty || courseExists.difficulty
        });

        // Add lesson to course
        courseExists.lessons.push(lesson._id);
        await courseExists.save();

        res.status(201).json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private/Admin
const updateLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const updatedLesson = await Lesson.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedLesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private/Admin
const deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        // Remove lesson from course
        await Course.findByIdAndUpdate(lesson.course, {
            $pull: { lessons: lesson._id }
        });

        await Lesson.findByIdAndDelete(req.params.id);

        res.json({ message: 'Lesson deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reorder lessons
// @route   PUT /api/lessons/reorder
// @access  Private/Admin
const reorderLessons = async (req, res) => {
    try {
        const { courseId, lessonOrders } = req.body;
        // lessonOrders: [{ lessonId, order }]

        for (const item of lessonOrders) {
            await Lesson.findByIdAndUpdate(item.lessonId, { order: item.order });
        }

        res.json({ message: 'Lessons reordered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get next and previous lesson
// @route   GET /api/lessons/:id/navigation
// @access  Private
const getLessonNavigation = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const prevLesson = await Lesson.findOne({
            course: lesson.course,
            order: { $lt: lesson.order }
        }).sort({ order: -1 }).select('_id title');

        const nextLesson = await Lesson.findOne({
            course: lesson.course,
            order: { $gt: lesson.order }
        }).sort({ order: 1 }).select('_id title');

        res.json({
            current: { _id: lesson._id, title: lesson.title, order: lesson.order },
            previous: prevLesson,
            next: nextLesson
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getLessonsByCourse,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    getLessonNavigation
};
