const { Quiz, Question, User } = require('../models');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Creator)
exports.createQuiz = async (req, res) => {
    try {
        const { title, description, duration_minutes, start_time, access_code, questions, topic, is_ai_generated } = req.body;

        const quiz = await Quiz.create({
            title,
            description, // Ensure model has this or remove if not
            duration_minutes,
            start_time,
            access_code,
            topic,
            is_ai_generated,
            creator_id: req.user.id
        });

        if (questions && questions.length > 0) {
            const formattedQuestions = questions.map(q => ({
                ...q,
                quiz_id: quiz.id
            }));
            await Question.bulkCreate(formattedQuestions);
        }

        const fullQuiz = await Quiz.findByPk(quiz.id, {
            include: [Question]
        });

        res.status(201).json({ success: true, data: fullQuiz });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Private
exports.getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.findAll({
            include: [
                { model: User, attributes: ['username'] },
                { model: Question, attributes: ['id'] } // Just count or ids?
            ],
            order: [['start_time', 'ASC']]
        });
        res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByPk(req.params.id, {
            include: [{ model: Question }]
        });

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        res.status(200).json({ success: true, data: quiz });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Creator only)
exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByPk(req.params.id);

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        // Check ownership
        if (quiz.creator_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized to delete this quiz' });
        }

        await quiz.destroy();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
