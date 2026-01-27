const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');
const { sanitizeInput } = require('./middleware/validation');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security Middleware
app.use(helmet()); // Sets various HTTP headers for security
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(sanitizeInput); // Prevent NoSQL injection
app.use('/api', apiLimiter); // Rate limiting for all API routes

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/assessment', require('./routes/assessmentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/lessons', require('./routes/lessonRoutes'));
app.use('/api/learning-path', require('./routes/learningPathRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/certification', require('./routes/certificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

app.get('/', (req, res) => {
    res.send('AI Learning Path Generator API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

