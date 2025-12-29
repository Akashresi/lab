const http = require('http');
const app = require('./app');
const socketUtils = require('./utils/socket'); // We'll create this helper
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Create HTTP server (needed for Socket.io)
const server = http.createServer(app);

// Initialize Socket.io
const io = require('socket.io')(server, {
    cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
    }
});

// Pass io instance to app/routes if needed via app.set or separate module
global.io = io;

// Socket Logic Stub
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_quiz', (quizId) => {
        socket.join(`quiz_${quizId}`);
        console.log(`Socket ${socket.id} joined quiz_${quizId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
