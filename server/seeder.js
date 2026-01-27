const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');

dotenv.config();

const questions = [
    // ============ FRONTEND - Beginner ============
    {
        text: "What is React?",
        options: ["A Backend Framework", "A Frontend Library", "A Database", "An Operating System"],
        correctAnswer: 1,
        category: "Frontend",
        difficulty: "Beginner",
        tags: ["React", "JavaScript"],
        points: 10,
        explanation: "React is a JavaScript library for building user interfaces, developed by Facebook.",
        timeLimit: 30
    },
    {
        text: "What does CSS stand for?",
        options: ["Central Style Sheets", "Cascading Style Sheets", "Colored Style Sheets", "Computer Style Sheets"],
        correctAnswer: 1,
        category: "Frontend",
        difficulty: "Beginner",
        tags: ["CSS"],
        points: 10,
        explanation: "CSS stands for Cascading Style Sheets, used for styling web pages.",
        timeLimit: 30
    },
    {
        text: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
        correctAnswer: 0,
        category: "Frontend",
        difficulty: "Beginner",
        tags: ["HTML"],
        points: 10,
        explanation: "HTML stands for Hyper Text Markup Language, the standard markup language for web pages.",
        timeLimit: 30
    },
    {
        text: "Which HTML tag is used to create a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        correctAnswer: 1,
        category: "Frontend",
        difficulty: "Beginner",
        tags: ["HTML"],
        points: 10,
        explanation: "The <a> (anchor) tag is used to create hyperlinks in HTML.",
        timeLimit: 30
    },
    {
        text: "Which property is used to change background color in CSS?",
        options: ["color", "bgcolor", "background-color", "bg-color"],
        correctAnswer: 2,
        category: "Frontend",
        difficulty: "Beginner",
        tags: ["CSS"],
        points: 10,
        explanation: "The 'background-color' property sets the background color of an element.",
        timeLimit: 30
    },

    // ============ FRONTEND - Intermediate ============
    {
        text: "What is the virtual DOM in React?",
        options: ["A backup of the real DOM", "A lightweight copy of the real DOM for optimization", "A database for storing DOM elements", "A browser feature"],
        correctAnswer: 1,
        category: "Frontend",
        difficulty: "Intermediate",
        tags: ["React", "JavaScript"],
        points: 15,
        explanation: "The Virtual DOM is a lightweight copy of the actual DOM that React uses to optimize updates.",
        timeLimit: 45
    },
    {
        text: "What hook is used to manage state in functional React components?",
        options: ["useEffect", "useState", "useContext", "useReducer"],
        correctAnswer: 1,
        category: "Frontend",
        difficulty: "Intermediate",
        tags: ["React", "Hooks"],
        points: 15,
        explanation: "useState is the primary hook for managing local state in functional components.",
        timeLimit: 30
    },
    {
        text: "What is the CSS Box Model comprised of?",
        options: ["Content, Padding, Border, Margin", "Header, Body, Footer, Sidebar", "Width, Height, Depth, Color", "Flexbox, Grid, Float, Position"],
        correctAnswer: 0,
        category: "Frontend",
        difficulty: "Intermediate",
        tags: ["CSS"],
        points: 15,
        explanation: "The CSS Box Model consists of Content, Padding, Border, and Margin from inside out.",
        timeLimit: 45
    },
    {
        text: "What does 'use strict' do in JavaScript?",
        options: ["Makes code run faster", "Enforces stricter parsing and error handling", "Enables ES6 features", "Disables debugging"],
        correctAnswer: 1,
        category: "Frontend",
        difficulty: "Intermediate",
        tags: ["JavaScript"],
        points: 15,
        explanation: "'use strict' enables strict mode which catches common coding mistakes and unsafe actions.",
        timeLimit: 45
    },
    {
        text: "Which CSS property is used to create flexible layouts?",
        options: ["float", "position", "display: flex", "margin: auto"],
        correctAnswer: 2,
        category: "Frontend",
        difficulty: "Intermediate",
        tags: ["CSS", "Flexbox"],
        points: 15,
        explanation: "display: flex enables the Flexbox layout model for creating flexible, responsive designs.",
        timeLimit: 30
    },

    // ============ FRONTEND - Advanced ============
    {
        text: "What is React's reconciliation algorithm?",
        options: ["A sorting algorithm", "A diffing algorithm for efficient DOM updates", "A routing mechanism", "A state management pattern"],
        correctAnswer: 1,
        category: "Frontend",
        difficulty: "Advanced",
        tags: ["React", "Performance"],
        points: 20,
        explanation: "Reconciliation is React's diffing algorithm that compares Virtual DOM trees to minimize actual DOM updates.",
        timeLimit: 60
    },
    {
        text: "What is the purpose of React.memo()?",
        options: ["To store data in memory", "To memoize component rendering for performance", "To create memos or notes", "To memorize user inputs"],
        correctAnswer: 1,
        category: "Frontend",
        difficulty: "Advanced",
        tags: ["React", "Performance"],
        points: 20,
        explanation: "React.memo() is a higher-order component that memoizes the result to prevent unnecessary re-renders.",
        timeLimit: 45
    },

    // ============ BACKEND - Beginner ============
    {
        text: "What is Node.js?",
        options: ["A Library", "A JavaScript Runtime Environment", "A Browser", "A Programming Language"],
        correctAnswer: 1,
        category: "Backend",
        difficulty: "Beginner",
        tags: ["Node.js", "JavaScript"],
        points: 10,
        explanation: "Node.js is a JavaScript runtime built on Chrome's V8 engine for server-side programming.",
        timeLimit: 30
    },
    {
        text: "What does API stand for?",
        options: ["Application Programming Interface", "Advanced Programming Integration", "Application Process Integration", "Automated Programming Interface"],
        correctAnswer: 0,
        category: "Backend",
        difficulty: "Beginner",
        tags: ["API"],
        points: 10,
        explanation: "API stands for Application Programming Interface, allowing applications to communicate.",
        timeLimit: 30
    },
    {
        text: "What is Express.js?",
        options: ["A database", "A web framework for Node.js", "A frontend library", "A testing tool"],
        correctAnswer: 1,
        category: "Backend",
        difficulty: "Beginner",
        tags: ["Express", "Node.js"],
        points: 10,
        explanation: "Express.js is a minimal and flexible Node.js web application framework.",
        timeLimit: 30
    },
    {
        text: "What HTTP method is used to retrieve data?",
        options: ["POST", "PUT", "GET", "DELETE"],
        correctAnswer: 2,
        category: "Backend",
        difficulty: "Beginner",
        tags: ["HTTP", "REST"],
        points: 10,
        explanation: "GET is the HTTP method used to request/retrieve data from a server.",
        timeLimit: 30
    },
    {
        text: "What is middleware in Express?",
        options: ["Database software", "Functions that execute during request-response cycle", "A type of API", "Frontend component"],
        correctAnswer: 1,
        category: "Backend",
        difficulty: "Beginner",
        tags: ["Express", "Middleware"],
        points: 10,
        explanation: "Middleware functions have access to the request and response objects and can modify them.",
        timeLimit: 30
    },

    // ============ BACKEND - Intermediate ============
    {
        text: "What is JWT used for?",
        options: ["Database queries", "Secure authentication tokens", "File compression", "Frontend routing"],
        correctAnswer: 1,
        category: "Backend",
        difficulty: "Intermediate",
        tags: ["JWT", "Authentication"],
        points: 15,
        explanation: "JWT (JSON Web Token) is used for securely transmitting information for authentication.",
        timeLimit: 45
    },
    {
        text: "What is the purpose of environment variables?",
        options: ["To style applications", "To store configuration and sensitive data", "To create animations", "To write tests"],
        correctAnswer: 1,
        category: "Backend",
        difficulty: "Intermediate",
        tags: ["Environment", "Security"],
        points: 15,
        explanation: "Environment variables store configuration settings and sensitive data outside the codebase.",
        timeLimit: 45
    },
    {
        text: "What does REST stand for?",
        options: ["Representational State Transfer", "Remote Execution State Transfer", "Request State Transmission", "Reliable State Transfer"],
        correctAnswer: 0,
        category: "Backend",
        difficulty: "Intermediate",
        tags: ["REST", "API"],
        points: 15,
        explanation: "REST stands for Representational State Transfer, an architectural style for APIs.",
        timeLimit: 45
    },
    {
        text: "What is the event loop in Node.js?",
        options: ["A for loop for events", "A mechanism for handling async operations", "A debugging tool", "A type of database query"],
        correctAnswer: 1,
        category: "Backend",
        difficulty: "Intermediate",
        tags: ["Node.js", "Async"],
        points: 15,
        explanation: "The event loop handles asynchronous callbacks, enabling non-blocking I/O operations.",
        timeLimit: 45
    },

    // ============ BACKEND - Advanced ============
    {
        text: "What is rate limiting in APIs?",
        options: ["Limiting database records", "Controlling the number of requests a client can make", "Limiting file upload size", "Controlling memory usage"],
        correctAnswer: 1,
        category: "Backend",
        difficulty: "Advanced",
        tags: ["API", "Security"],
        points: 20,
        explanation: "Rate limiting restricts the number of API requests a client can make in a time period.",
        timeLimit: 60
    },
    {
        text: "What is the purpose of connection pooling?",
        options: ["To share network connections", "To reuse database connections for efficiency", "To pool user sessions", "To manage memory pools"],
        correctAnswer: 1,
        category: "Backend",
        difficulty: "Advanced",
        tags: ["Database", "Performance"],
        points: 20,
        explanation: "Connection pooling reuses database connections to reduce overhead and improve performance.",
        timeLimit: 60
    },

    // ============ DATABASE - Beginner ============
    {
        text: "Which of these is a NoSQL database?",
        options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
        correctAnswer: 2,
        category: "Database",
        difficulty: "Beginner",
        tags: ["MongoDB", "NoSQL"],
        points: 10,
        explanation: "MongoDB is a document-based NoSQL database, unlike the SQL-based alternatives.",
        timeLimit: 30
    },
    {
        text: "What does CRUD stand for?",
        options: ["Create, Read, Update, Delete", "Create, Run, Upload, Download", "Copy, Read, Undo, Delete", "Create, Retrieve, Upload, Deploy"],
        correctAnswer: 0,
        category: "Database",
        difficulty: "Beginner",
        tags: ["Database", "Operations"],
        points: 10,
        explanation: "CRUD represents the four basic operations: Create, Read, Update, Delete.",
        timeLimit: 30
    },
    {
        text: "What is a primary key?",
        options: ["The first column", "A unique identifier for records", "A password field", "The table name"],
        correctAnswer: 1,
        category: "Database",
        difficulty: "Beginner",
        tags: ["Database", "Schema"],
        points: 10,
        explanation: "A primary key uniquely identifies each record in a database table.",
        timeLimit: 30
    },

    // ============ DATABASE - Intermediate ============
    {
        text: "What is indexing in databases?",
        options: ["Numbering rows", "A technique to speed up data retrieval", "Sorting data alphabetically", "Creating backups"],
        correctAnswer: 1,
        category: "Database",
        difficulty: "Intermediate",
        tags: ["Database", "Performance"],
        points: 15,
        explanation: "Indexing creates a data structure to improve the speed of data retrieval operations.",
        timeLimit: 45
    },
    {
        text: "What is MongoDB's equivalent of a table?",
        options: ["Schema", "Collection", "Document", "Database"],
        correctAnswer: 1,
        category: "Database",
        difficulty: "Intermediate",
        tags: ["MongoDB", "NoSQL"],
        points: 15,
        explanation: "In MongoDB, a collection is equivalent to a table in relational databases.",
        timeLimit: 30
    },

    // ============ GENERAL - Beginner ============
    {
        text: "What is version control?",
        options: ["Managing software versions", "Tracking and managing code changes", "Controlling user access", "Managing database versions"],
        correctAnswer: 1,
        category: "General",
        difficulty: "Beginner",
        tags: ["Git", "Version Control"],
        points: 10,
        explanation: "Version control systems track and manage changes to code over time.",
        timeLimit: 30
    },
    {
        text: "What is Git?",
        options: ["A programming language", "A distributed version control system", "A database", "A web server"],
        correctAnswer: 1,
        category: "General",
        difficulty: "Beginner",
        tags: ["Git"],
        points: 10,
        explanation: "Git is a distributed version control system for tracking code changes.",
        timeLimit: 30
    },
    {
        text: "What is debugging?",
        options: ["Writing code", "Finding and fixing errors in code", "Testing user interface", "Deploying applications"],
        correctAnswer: 1,
        category: "General",
        difficulty: "Beginner",
        tags: ["Programming"],
        points: 10,
        explanation: "Debugging is the process of identifying and removing errors from software.",
        timeLimit: 30
    },

    // ============ GENERAL - Intermediate ============
    {
        text: "What is the DRY principle?",
        options: ["Don't Repeat Yourself", "Do Repeat Yourself", "Data Retrieval Yield", "Dynamic Response Yielding"],
        correctAnswer: 0,
        category: "General",
        difficulty: "Intermediate",
        tags: ["Programming", "Best Practices"],
        points: 15,
        explanation: "DRY (Don't Repeat Yourself) promotes code reuse and reducing repetition.",
        timeLimit: 45
    },
    {
        text: "What is an algorithm?",
        options: ["A programming language", "A step-by-step procedure for solving a problem", "A type of database", "A security protocol"],
        correctAnswer: 1,
        category: "General",
        difficulty: "Intermediate",
        tags: ["Programming", "Algorithms"],
        points: 15,
        explanation: "An algorithm is a set of instructions designed to perform a specific task.",
        timeLimit: 45
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-learning-path');
        await Question.deleteMany();
        await Question.insertMany(questions);
        console.log(`Database Seeded Successfully with ${questions.length} questions!`);
        console.log('\nCategories seeded:');
        const categories = [...new Set(questions.map(q => q.category))];
        categories.forEach(cat => {
            const count = questions.filter(q => q.category === cat).length;
            console.log(`  - ${cat}: ${count} questions`);
        });
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
