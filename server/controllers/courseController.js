const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
    try {
        const { category, difficulty, search, page = 1, limit = 10 } = req.query;

        let query = { isPublished: true };

        if (category && category !== 'all') {
            query.category = category;
        }
        if (difficulty && difficulty !== 'all') {
            query.difficulty = difficulty;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const courses = await Course.find(query)
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Course.countDocuments(query);

        res.json({
            courses,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single course with lessons
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate('prerequisites', 'title')
            .populate({
                path: 'lessons',
                select: 'title description duration order contentType',
                options: { sort: { order: 1 } }
            });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
    try {
        const { title, description, category, difficulty, thumbnail, duration, tags, prerequisites } = req.body;

        const course = await Course.create({
            title,
            description,
            category,
            difficulty,
            thumbnail,
            duration,
            tags: tags || [],
            prerequisites: prerequisites || [],
            createdBy: req.user.id
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );

        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Delete all lessons associated with this course
        await Lesson.deleteMany({ course: req.params.id });
        await Course.findByIdAndDelete(req.params.id);

        res.json({ message: 'Course and associated lessons deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Publish/Unpublish course
// @route   PUT /api/courses/:id/publish
// @access  Private/Admin
const togglePublish = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        course.isPublished = !course.isPublished;
        await course.save();

        res.json({ message: `Course ${course.isPublished ? 'published' : 'unpublished'}`, course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get course categories
// @route   GET /api/courses/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Course.aggregate([
            { $match: { isPublished: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json(categories.map(c => ({ category: c._id, count: c.count })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
const enrollCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        course.enrolledCount += 1;
        await course.save();

        res.json({ message: 'Enrolled successfully', course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    togglePublish,
    getCategories,
    enrollCourse
};
