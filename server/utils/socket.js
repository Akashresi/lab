// server/utils/socket.js

const { Attempt, Quiz } = require("../models");

module.exports = (io) => {
    // Safety check (prevents silent crashes)
    if (!io) {
        throw new Error("Socket.io instance is undefined");
    }

    io.on("connection", (socket) => {
        console.log("🔌 New client connected:", socket.id);

        /**
         * =========================
         * JOIN QUIZ ROOM
         * =========================
         */
        socket.on("join_quiz", ({ quizId, userId }) => {
            if (!quizId || !userId) {
                return;
            }

            const room = `quiz_${quizId}`;
            socket.join(room);

            console.log(`👤 User ${userId} joined quiz ${quizId}`);

            // Notify others in the room
            socket.to(room).emit("participant_joined", { userId });
        });

        /**
         * =========================
         * START QUIZ
         * =========================
         */
        socket.on("start_quiz", async ({ quizId }) => {
            if (!quizId) return;

            try {
                // (Optional) Validate quiz exists
                const quiz = await Quiz.findByPk(quizId);
                if (!quiz) {
                    return;
                }

                io.to(`quiz_${quizId}`).emit("quiz_started", {
                    startTime: new Date(),
                });

                console.log(`🚀 Quiz ${quizId} started`);
            } catch (err) {
                console.error("❌ Error starting quiz:", err);
            }
        });

        /**
         * =========================
         * SUBMIT ANSWER (REAL-TIME)
         * =========================
         */
        socket.on("submit_answer", async ({ quizId, userId, questionId, answer }) => {
            if (!quizId || !userId || !questionId) return;

            try {
                // Optional: save attempt (if model exists)
                await Attempt.create({
                    quizId,
                    userId,
                    questionId,
                    answer,
                });

                // Broadcast progress
                io.to(`quiz_${quizId}`).emit("participant_progress", {
                    userId,
                    questionId,
                });
            } catch (err) {
                console.error("❌ Error submitting answer:", err);
            }
        });

        /**
         * =========================
         * DISCONNECT
         * =========================
         */
        socket.on("disconnect", () => {
            console.log("❌ Client disconnected:", socket.id);
        });
    });
};
