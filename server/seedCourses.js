const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Question = require('./models/Question');
const User = require('./models/User');

dotenv.config();

const coursesData = [
    // Frontend Courses
    {
        title: 'HTML & CSS Fundamentals',
        description: 'Master the building blocks of web development. Learn HTML5 semantic elements, CSS3 styling, Flexbox, Grid, and responsive design principles.',
        category: 'Frontend',
        difficulty: 'Beginner',
        duration: '8 hours',
        isPublished: true,
        lessons: [
            { title: 'Introduction to HTML', content: 'Learn the basics of HTML including tags, elements, and document structure.', duration: 30, order: 1 },
            { title: 'HTML Forms & Tables', content: 'Create interactive forms and structured tables for data display.', duration: 45, order: 2 },
            { title: 'CSS Basics & Selectors', content: 'Understanding CSS syntax, selectors, and the cascade.', duration: 40, order: 3 },
            { title: 'Flexbox Layout', content: 'Master flexible box layout for responsive designs.', duration: 50, order: 4 },
            { title: 'CSS Grid', content: 'Create complex two-dimensional layouts with CSS Grid.', duration: 55, order: 5 }
        ]
    },
    {
        title: 'JavaScript Essentials',
        description: 'Learn JavaScript from scratch. Cover variables, functions, DOM manipulation, async programming, and modern ES6+ features.',
        category: 'Frontend',
        difficulty: 'Beginner',
        duration: '12 hours',
        isPublished: true,
        lessons: [
            { title: 'Variables & Data Types', content: 'Understanding let, const, var and JavaScript data types.', duration: 35, order: 1 },
            { title: 'Functions & Scope', content: 'Creating functions, arrow functions, and understanding scope.', duration: 45, order: 2 },
            { title: 'Arrays & Objects', content: 'Working with arrays, objects, and their methods.', duration: 50, order: 3 },
            { title: 'DOM Manipulation', content: 'Selecting and modifying HTML elements with JavaScript.', duration: 60, order: 4 },
            { title: 'Async JavaScript', content: 'Promises, async/await, and handling asynchronous operations.', duration: 55, order: 5 }
        ]
    },
    {
        title: 'React.js Complete Guide',
        description: 'Build modern web applications with React. Learn components, hooks, state management, routing, and best practices.',
        category: 'Frontend',
        difficulty: 'Intermediate',
        duration: '16 hours',
        isPublished: true,
        lessons: [
            { title: 'React Introduction & Setup', content: 'Understanding React philosophy and setting up development environment.', duration: 30, order: 1 },
            { title: 'Components & Props', content: 'Building reusable components and passing data with props.', duration: 45, order: 2 },
            { title: 'State & Lifecycle', content: 'Managing component state and lifecycle methods.', duration: 50, order: 3 },
            { title: 'React Hooks Deep Dive', content: 'useState, useEffect, useContext, and custom hooks.', duration: 60, order: 4 },
            { title: 'React Router', content: 'Client-side routing and navigation in React apps.', duration: 45, order: 5 }
        ]
    },
    {
        title: 'Advanced CSS & Animations',
        description: 'Take your CSS skills to the next level with animations, transitions, transforms, and modern CSS techniques.',
        category: 'Frontend',
        difficulty: 'Intermediate',
        duration: '10 hours',
        isPublished: true,
        lessons: [
            { title: 'CSS Transitions', content: 'Creating smooth transitions between states.', duration: 40, order: 1 },
            { title: 'CSS Animations', content: 'Keyframe animations and timing functions.', duration: 50, order: 2 },
            { title: 'CSS Transforms', content: '2D and 3D transforms for dynamic effects.', duration: 45, order: 3 },
            { title: 'CSS Variables', content: 'Using custom properties for theming and maintainability.', duration: 35, order: 4 }
        ]
    },
    {
        title: 'Tailwind CSS Mastery',
        description: 'Learn to build professional user interfaces quickly using Tailwind CSS utility-first framework.',
        category: 'Frontend',
        difficulty: 'Intermediate',
        duration: '6 hours',
        isPublished: true,
        lessons: [
            { title: 'Tailwind Installation', content: 'Setting up Tailwind in your project.', duration: 30, order: 1 },
            { title: 'Utility First Concept', content: 'Understanding utility classes.', duration: 45, order: 2 },
            { title: 'Responsive Design', content: 'Using breakpoints in Tailwind.', duration: 60, order: 3 }
        ]
    },
    // Backend Courses
    {
        title: 'Node.js Fundamentals',
        description: 'Learn server-side JavaScript with Node.js. Cover modules, file system, HTTP servers, and npm package management.',
        category: 'Backend',
        difficulty: 'Beginner',
        duration: '10 hours',
        isPublished: true,
        lessons: [
            { title: 'Introduction to Node.js', content: 'Understanding Node.js runtime and its event-driven architecture.', duration: 35, order: 1 },
            { title: 'Node.js Modules', content: 'Creating and using modules in Node.js.', duration: 40, order: 2 },
            { title: 'File System Operations', content: 'Reading and writing files with the fs module.', duration: 45, order: 3 },
            { title: 'HTTP Server Basics', content: 'Creating HTTP servers from scratch.', duration: 50, order: 4 },
            { title: 'NPM & Package Management', content: 'Managing dependencies with npm.', duration: 35, order: 5 }
        ]
    },
    {
        title: 'Express.js & REST APIs',
        description: 'Build robust REST APIs with Express.js. Learn routing, middleware, authentication, and error handling.',
        category: 'Backend',
        difficulty: 'Intermediate',
        duration: '14 hours',
        isPublished: true,
        lessons: [
            { title: 'Express.js Setup', content: 'Setting up Express server and basic routing.', duration: 30, order: 1 },
            { title: 'Middleware in Express', content: 'Understanding and creating middleware functions.', duration: 45, order: 2 },
            { title: 'RESTful API Design', content: 'Designing RESTful endpoints following best practices.', duration: 50, order: 3 },
            { title: 'Authentication with JWT', content: 'Implementing JSON Web Token authentication.', duration: 60, order: 4 },
            { title: 'Error Handling', content: 'Graceful error handling and validation.', duration: 40, order: 5 }
        ]
    },
    {
        title: 'Python for Backend Development',
        description: 'Learn Python backend development with Flask and Django basics, database integration, and API development.',
        category: 'Backend',
        difficulty: 'Beginner',
        duration: '15 hours',
        isPublished: true,
        lessons: [
            { title: 'Python Basics Refresher', content: 'Variables, data structures, and functions in Python.', duration: 45, order: 1 },
            { title: 'Flask Introduction', content: 'Building your first Flask application.', duration: 50, order: 2 },
            { title: 'Flask Routes & Templates', content: 'Creating routes and using Jinja2 templates.', duration: 55, order: 3 },
            { title: 'Django Basics', content: 'Getting started with Django framework.', duration: 60, order: 4 }
        ]
    },
    {
        title: 'API Security & Best Practices',
        description: 'Secure your APIs with authentication, authorization, rate limiting, and protection against common vulnerabilities.',
        category: 'Backend',
        difficulty: 'Advanced',
        duration: '12 hours',
        isPublished: true,
        lessons: [
            { title: 'API Security Fundamentals', content: 'Understanding common API vulnerabilities.', duration: 40, order: 1 },
            { title: 'OAuth 2.0 Implementation', content: 'Implementing OAuth 2.0 for secure authorization.', duration: 60, order: 2 },
            { title: 'Rate Limiting Strategies', content: 'Protecting APIs from abuse with rate limiting.', duration: 45, order: 3 },
            { title: 'Input Validation & Sanitization', content: 'Preventing injection attacks.', duration: 50, order: 4 }
        ]
    },
    {
        title: 'Go Programming for Scalability',
        description: 'Learn Go (Golang) for building high-performance backend systems and microservices.',
        category: 'Backend',
        difficulty: 'Intermediate',
        duration: '18 hours',
        isPublished: true,
        lessons: [
            { title: 'Go Syntax', content: 'Basics of Go.', duration: 45, order: 1 },
            { title: 'Concurrency in Go', content: 'Goroutines and channels.', duration: 60, order: 2 }
        ]
    },
    // Database Courses
    {
        title: 'MongoDB Essentials',
        description: 'Master MongoDB NoSQL database. Learn CRUD operations, indexing, aggregation, and data modeling.',
        category: 'Database',
        difficulty: 'Beginner',
        duration: '10 hours',
        isPublished: true,
        lessons: [
            { title: 'Introduction to NoSQL', content: 'Understanding NoSQL databases and MongoDB architecture.', duration: 35, order: 1 },
            { title: 'CRUD Operations', content: 'Create, Read, Update, Delete operations in MongoDB.', duration: 50, order: 2 },
            { title: 'MongoDB Queries', content: 'Advanced querying with operators and projections.', duration: 55, order: 3 },
            { title: 'Indexing & Performance', content: 'Optimizing queries with indexes.', duration: 45, order: 4 },
            { title: 'Aggregation Pipeline', content: 'Data processing with aggregation framework.', duration: 60, order: 5 }
        ]
    },
    {
        title: 'SQL & Relational Databases',
        description: 'Learn SQL from basics to advanced. Cover MySQL/PostgreSQL, joins, subqueries, and database design.',
        category: 'Database',
        difficulty: 'Beginner',
        duration: '14 hours',
        isPublished: true,
        lessons: [
            { title: 'Introduction to SQL', content: 'Understanding relational databases and SQL syntax.', duration: 40, order: 1 },
            { title: 'SELECT Queries', content: 'Retrieving data with SELECT statements.', duration: 45, order: 2 },
            { title: 'Joins & Relationships', content: 'Combining data from multiple tables.', duration: 55, order: 3 },
            { title: 'Database Design', content: 'Normalization and ER diagrams.', duration: 50, order: 4 },
            { title: 'Stored Procedures', content: 'Creating reusable database procedures.', duration: 45, order: 5 }
        ]
    },
    {
        title: 'Database Design Patterns',
        description: 'Advanced database design patterns, schema optimization, and best practices for scalable applications.',
        category: 'Database',
        difficulty: 'Advanced',
        duration: '10 hours',
        isPublished: true,
        lessons: [
            { title: 'Schema Design Patterns', content: 'Common patterns for document and relational databases.', duration: 50, order: 1 },
            { title: 'Sharding Strategies', content: 'Horizontal scaling with database sharding.', duration: 55, order: 2 },
            { title: 'Replication & High Availability', content: 'Ensuring database uptime with replication.', duration: 45, order: 3 }
        ]
    },
    // DevOps Courses
    {
        title: 'Git & Version Control',
        description: 'Master Git version control. Learn branching, merging, rebasing, and collaborative workflows.',
        category: 'DevOps',
        difficulty: 'Beginner',
        duration: '6 hours',
        isPublished: true,
        lessons: [
            { title: 'Git Basics', content: 'Initializing repos, staging, and committing.', duration: 35, order: 1 },
            { title: 'Branching & Merging', content: 'Creating branches and merging changes.', duration: 45, order: 2 },
            { title: 'Remote Repositories', content: 'Working with GitHub/GitLab.', duration: 40, order: 3 },
            { title: 'Git Workflows', content: 'GitFlow, trunk-based development, and team practices.', duration: 35, order: 4 }
        ]
    },
    {
        title: 'Docker Fundamentals',
        description: 'Learn containerization with Docker. Create images, manage containers, and use Docker Compose.',
        category: 'DevOps',
        difficulty: 'Intermediate',
        duration: '12 hours',
        isPublished: true,
        lessons: [
            { title: 'Introduction to Containers', content: 'Understanding containers vs virtual machines.', duration: 35, order: 1 },
            { title: 'Docker Images & Containers', content: 'Building and running Docker containers.', duration: 50, order: 2 },
            { title: 'Dockerfile Best Practices', content: 'Writing efficient Dockerfiles.', duration: 45, order: 3 },
            { title: 'Docker Compose', content: 'Multi-container applications with Compose.', duration: 55, order: 4 },
            { title: 'Docker Networking', content: 'Container networking and service discovery.', duration: 40, order: 5 }
        ]
    },
    {
        title: 'CI/CD Pipeline Setup',
        description: 'Implement continuous integration and deployment pipelines with GitHub Actions, Jenkins, or GitLab CI.',
        category: 'DevOps',
        difficulty: 'Intermediate',
        duration: '10 hours',
        isPublished: true,
        lessons: [
            { title: 'CI/CD Concepts', content: 'Understanding continuous integration and deployment.', duration: 30, order: 1 },
            { title: 'GitHub Actions', content: 'Creating automated workflows with GitHub Actions.', duration: 55, order: 2 },
            { title: 'Testing in Pipelines', content: 'Automated testing as part of CI/CD.', duration: 45, order: 3 },
            { title: 'Deployment Strategies', content: 'Blue-green, canary, and rolling deployments.', duration: 50, order: 4 }
        ]
    },
    {
        title: 'Kubernetes for Beginners',
        description: 'Learn orchestration with Kubernetes. Deploy, scale and manage containerized applications.',
        category: 'DevOps',
        difficulty: 'Advanced',
        duration: '25 hours',
        isPublished: true,
        lessons: [
            { title: 'K8s Architecture', content: 'Understanding nodes, pods and control plane.', duration: 60, order: 1 }
        ]
    },
    // AI/ML Courses
    {
        title: 'Introduction to Machine Learning',
        description: 'Get started with machine learning concepts, algorithms, and practical applications using Python.',
        category: 'AI/ML',
        difficulty: 'Beginner',
        duration: '16 hours',
        isPublished: true,
        lessons: [
            { title: 'What is Machine Learning?', content: 'Understanding ML concepts and types.', duration: 40, order: 1 },
            { title: 'Python for ML', content: 'NumPy, Pandas, and Matplotlib basics.', duration: 55, order: 2 },
            { title: 'Supervised Learning', content: 'Regression and classification algorithms.', duration: 60, order: 3 },
            { title: 'Unsupervised Learning', content: 'Clustering and dimensionality reduction.', duration: 55, order: 4 },
            { title: 'Model Evaluation', content: 'Metrics and validation techniques.', duration: 45, order: 5 }
        ]
    },
    {
        title: 'Deep Learning with TensorFlow',
        description: 'Build neural networks with TensorFlow. Cover CNNs, RNNs, and practical deep learning projects.',
        category: 'AI/ML',
        difficulty: 'Advanced',
        duration: '20 hours',
        isPublished: true,
        lessons: [
            { title: 'Neural Network Basics', content: 'Understanding neurons, layers, and activation functions.', duration: 50, order: 1 },
            { title: 'TensorFlow Setup', content: 'Setting up TensorFlow and building first model.', duration: 45, order: 2 },
            { title: 'Convolutional Neural Networks', content: 'Image classification with CNNs.', duration: 70, order: 3 },
            { title: 'Recurrent Neural Networks', content: 'Sequence modeling with RNNs and LSTMs.', duration: 65, order: 4 }
        ]
    },
    {
        title: 'Natural Language Processing',
        description: 'Learn how to process and analyze text data using modern NLP techniques and transformer models.',
        category: 'AI/ML',
        difficulty: 'Advanced',
        duration: '20 hours',
        isPublished: true,
        lessons: [
            { title: 'Text Tokenization', content: 'Basics of text processing.', duration: 45, order: 1 }
        ]
    }
];

const questions = [
    { text: 'Which HTML5 element is used for navigation links?', options: ['<nav>', '<header>', '<section>', '<aside>'], correctAnswer: 0, category: 'Frontend', difficulty: 'Beginner', explanation: 'The <nav> element represents a section of navigation links.' },
    { text: 'What CSS property is used to create a flexible container?', options: ['display: flex', 'display: grid', 'display: block', 'display: inline'], correctAnswer: 0, category: 'Frontend', difficulty: 'Beginner', explanation: 'display: flex creates a flex container for flexible layouts.' },
    { text: 'What is the purpose of React.memo?', options: ['Prevents unnecessary re-renders', 'Creates memoized values', 'Stores references', 'Manages state'], correctAnswer: 0, category: 'Frontend', difficulty: 'Intermediate', explanation: 'React.memo is a higher-order component that prevents unnecessary re-renders.' }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-learning-path');
        console.log('Connected to MongoDB');

        // Dynamically fetch a user
        const user = await User.findOne();
        if (!user) {
            console.error('No user found in database. Please register a user first.');
            process.exit(1);
        }
        const creatorId = user._id;
        console.log(`Using user ID: ${creatorId} (${user.name || 'No Name'})`);

        // Clear existing data
        await Course.deleteMany({});
        await Lesson.deleteMany({});
        console.log('Cleared existing courses and lessons');

        // Insert courses and lessons
        for (const data of coursesData) {
            const { lessons: lessonsList, ...courseInfo } = data;

            const course = new Course({
                ...courseInfo,
                createdBy: creatorId,
                lessons: []
            });

            console.log(`Creating course: ${course.title}`);

            const lessonIds = [];
            for (const item of lessonsList) {
                const lesson = await Lesson.create({
                    ...item,
                    course: course._id
                });
                lessonIds.push(lesson._id);
            }

            course.lessons = lessonIds;
            course.totalLessons = lessonIds.length;
            await course.save();

            console.log(`  Added ${lessonIds.length} lessons`);
        }

        // Add questions if needed
        const existingQuestions = await Question.countDocuments();
        if (existingQuestions < 5) {
            await Question.insertMany(questions);
            console.log(`Added ${questions.length} assessment questions`);
        }

        console.log('\n✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:');
        if (error.name === 'ValidationError') {
            for (let field in error.errors) {
                console.error(`- ${field}: ${error.errors[field].message}`);
            }
        } else {
            console.error(error);
        }
        process.exit(1);
    }
};

seedDatabase();
