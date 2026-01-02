const { Quiz, Question, User, QuizSubmission } = require("../models");
const { callAI } = require('../utils/aiHelper');

/**
 * ============================
 * CREATE QUIZ
 * ============================
 */
exports.createQuiz = async (req, res) => {
    try {
        const {
            title,
            description,
            duration_minutes,
            start_time,
            access_code,
            questions,
            topic,
            is_ai_generated,
            type,
            difficulty // Added difficulty
        } = req.body;

        const quiz = await Quiz.create({
            title,
            description, // Not in strict schema but useful if model supports it? Model doesnt have description. I'll ignore or check model.
            // Quiz Model has: title, topic, difficulty, access_code, start_time, duration_minutes, is_ai_generated, creator_id
            duration_minutes,
            start_time,
            access_code,
            topic,
            difficulty,
            is_ai_generated,
            // type removed from model definition based on strict schema, strictly 'quizzes' table. 
            creator_id: req.user.id,
        });

        if (Array.isArray(questions) && questions.length > 0) {
            const formattedQuestions = questions.map((q) => ({
                quiz_id: quiz.id,
                text: q.text,
                question: q.text, // Schema requires 'question' column
                options: q.options,
                correct_index: q.correct_index,
                type: q.type || 'mcq',
                semantic_answer: q.semantic_answer,
                explanation: q.explanation
            }));
            await Question.bulkCreate(formattedQuestions);
        }

        const fullQuiz = await Quiz.findByPk(quiz.id, {
            include: [Question],
        });

        res.status(201).json({ success: true, data: fullQuiz });
    } catch (error) {
        console.error("❌ Create Quiz Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

/**
 * ============================
 * GET ALL QUIZZES
 * ============================
 */
exports.getQuizzes = async (req, res) => {
    try {
        // Simple list
        const quizzes = await Quiz.findAll({
            include: [
                { model: User, attributes: ["username"] },
                { model: Question, attributes: ["id"] },
            ],
            order: [["start_time", "ASC"]],
        });

        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

/**
 * ============================
 * GET SINGLE QUIZ
 * ============================
 */
exports.getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByPk(req.params.id, {
            include: [{ model: Question }],
        });

        if (!quiz) {
            return res
                .status(404)
                .json({ success: false, error: "Quiz not found" });
        }

        res.status(200).json({ success: true, data: quiz });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

/**
 * ============================
 * DELETE QUIZ
 * ============================
 */
exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByPk(req.params.id);

        if (!quiz) {
            return res
                .status(404)
                .json({ success: false, error: "Quiz not found" });
        }

        if (
            quiz.creator_id !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(401).json({
                success: false,
                error: "Not authorized to delete this quiz",
            });
        }

        await quiz.destroy();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

/**
 * ============================
 * SUBMIT QUIZ
 * ============================
 */
exports.submitQuiz = async (req, res) => {
    try {
        // 🔐 Auth safety
        if (!req.user || !req.user.id) {
            return res
                .status(401)
                .json({ success: false, error: "Unauthorized" });
        }

        const { answers } = req.body; // Array of answers
        const quizId = req.params.id;
        const userId = req.user.id;

        const quiz = await Quiz.findByPk(quizId, {
            include: [{ model: Question }],
        });

        if (!quiz) {
            return res.status(404).json({ success: false, error: "Quiz not found" });
        }

        const totalQuestions = quiz.Questions.length;
        let correctCount = 0;

        // Grading Logic
        // ... (Logic kept same, just saving differently)
        const gradingPromises = quiz.Questions.map(async (question, i) => {
            const userAns = answers[i];
            let isCorrect = false;

            if (question.type === 'interactive') {
                if (userAns && typeof userAns === 'string' && userAns.trim().length > 0) {
                    // AI Grading Placeholder or Logic
                    const target = (question.semantic_answer || '').toLowerCase();
                    isCorrect = userAns.toLowerCase().includes(target);
                    // Call AI here if needed, kept simplified for now to match strict schema move
                }
            } else {
                // MCQ Grading
                if (userAns !== undefined) {
                    isCorrect = parseInt(userAns) === question.correct_index;
                }
            }

            return {
                questionId: question.id,
                userAnswer: userAns,
                isCorrect
            };
        });

        const detailedResults = await Promise.all(gradingPromises);
        correctCount = detailedResults.filter(r => r.isCorrect).length;

        const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

        // Save Result to QuizSubmission
        const submission = await QuizSubmission.create({
            quiz_id: quizId,
            user_id: userId,
            answers: detailedResults, // Storing detailed breakdown in JSONB
            ai_score: percentage, // Using ai_score as the main score field
            // submitted_at auto set
        });

        res.status(200).json({
            success: true,
            message: "Assessment Submitted Successfully",
            data: submission
        });

    } catch (error) {
        console.error("❌ Submit Quiz Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

/**
 * ============================
 * GET QUIZ RESULTS (Creator)
 * ============================
 */
exports.getQuizResults = async (req, res) => {
    try {
        const quiz = await Quiz.findByPk(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        if (quiz.creator_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const results = await QuizSubmission.findAll({
            where: { quiz_id: req.params.id },
            include: [{ model: User, attributes: ['username', 'email'] }],
            order: [['submitted_at', 'DESC']]
        });

        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

exports.exportQuizResults = async (req, res) => {
    // Placeholder for export logic using getQuizResults data
    res.status(501).json({ message: "Not implemented yet" });
};
