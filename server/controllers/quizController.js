const { Quiz, Question, User, Result, Attempt, TimeLog } = require("../models");

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
        } = req.body;

        const quiz = await Quiz.create({
            title,
            description,
            duration_minutes,
            start_time,
            access_code,
            topic,
            is_ai_generated,
            creator_id: req.user.id,
        });

        if (Array.isArray(questions) && questions.length > 0) {
            const formattedQuestions = questions.map((q) => ({
                ...q,
                quiz_id: quiz.id,
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

        const { answers, time_taken } = req.body;
        const quizId = req.params.id;
        const userId = req.user.id;

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                error: "Answers must be an array",
            });
        }

        const quiz = await Quiz.findByPk(quizId, {
            include: [{ model: Question }],
        });

        if (!quiz) {
            return res
                .status(404)
                .json({ success: false, error: "Quiz not found" });
        }

        const totalQuestions = quiz.Questions.length;
        let correctCount = 0;
        const detailedResults = [];

        quiz.Questions.forEach((question, index) => {
            const userAnsIndex = answers[index];
            const isCorrect =
                userAnsIndex === question.correct_index;

            if (isCorrect) correctCount++;

            detailedResults.push({
                questionId: question.id,
                userAnswer: userAnsIndex,
                correctAnswer: question.correct_index,
                isCorrect,
            });
        });

        const percentage =
            totalQuestions > 0
                ? (correctCount / totalQuestions) * 100
                : 0;

        const status = percentage >= 60 ? "Pass" : "Fail";

        // Save Result
        const result = await Result.create({
            user_id: userId,
            type: "quiz",
            quiz_id: quizId,
            score: correctCount,
            total_score: totalQuestions,
            percentage,
            accuracy: `${correctCount}/${totalQuestions}`,
            time_taken,
            status,
            details: { answers: detailedResults },
        });

        // Attempt log
        await Attempt.create({
            user_id: userId,
            quiz_id: quizId,
            answers,
            score: correctCount,
            is_late: false,
        });

        // Time log
        await TimeLog.create({
            user_id: userId,
            type: "quiz",
            reference_id: quizId,
            time_spent: time_taken,
            started_at: new Date(Date.now() - time_taken * 1000),
            ended_at: new Date(),
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("❌ Submit Quiz Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};
