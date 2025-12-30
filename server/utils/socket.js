const { Attempt, Quiz } = require('../models');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Join a quiz room
        socket.on('join_quiz', ({ quizId, userId }) => {
            socket.join(`quiz_${quizId}`);
            console.log(`User ${userId} joined quiz ${quizId}`);
            // Notify others?
            io.to(`quiz_${quizId}`).emit('participant_joined', { userId });
        });

        // Start Quiz (Creator only trigger ideally, but validated on backend)
        socket.on('start_quiz', async ({ quizId }) => {
            // Update DB status
            try {
                // In a real app we'd verify ownership here or trust the authorized API call made prior
                io.to(`quiz_${quizId}`).emit('quiz_started', { startTime: new Date() });

                // Start countdown logic if managed by server (optional for this scope)
            } catch (err) {
                console.error(err);
            }
        });

        // Submit Answer (Real-time updates)
        socket.on('submit_answer', ({ quizId, userId, questionId, answer }) => {
            // Log attempt or update live scoreboard
            // For now, just ack or broadcast progress
            // io.to(`quiz_${quizId}`).emit('participant_progress', { userId, progress: ... });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
