const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');

// Connect to Database
// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Body parser
app.use(cors()); // Enable CORS
app.use(helmet()); // Set security headers
app.use(xss()); // Prevent XSS attacks

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Mount Routes
app.get('/', (req, res) => res.send('QuizMaster Pro API Running...'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Server Error' });
});

module.exports = app;
