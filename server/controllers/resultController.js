const { QuizSubmission, ChallengeSubmission, User, Quiz, CodeChallenge } = require('../models');

// @desc    Get user results (Merged View)
// @route   GET /api/results
// @access  Private
exports.getResults = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch Quiz Submissions
        const quizSubs = await QuizSubmission.findAll({
            where: { user_id: userId },
            include: [{ model: Quiz, attributes: ['title'] }],
            order: [['submitted_at', 'DESC']]
        });

        // Fetch Challenge Submissions
        const challengeSubs = await ChallengeSubmission.findAll({
            where: { user_id: userId },
            include: [{ model: CodeChallenge, attributes: ['title'] }],
            order: [['submitted_at', 'DESC']]
        });

        // Merge & Sort (Simple merge for display)
        const combined = [
            ...quizSubs.map(qs => ({
                id: qs.id,
                type: 'quiz',
                title: qs.Quiz ? qs.Quiz.title : 'Deleted Quiz',
                score: qs.ai_score,
                date: qs.submitted_at
            })),
            ...challengeSubs.map(cs => ({
                id: cs.id,
                type: 'challenge',
                title: cs.CodeChallenge ? cs.CodeChallenge.title : 'Deleted Challenge',
                score: cs.ai_score,
                date: cs.submitted_at
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({ success: true, count: combined.length, data: combined });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Export results to Excel
// @route   GET /api/results/export
exports.exportResults = async (req, res) => {
    // Basic export implementation could go here, merging similar to above
    res.status(501).json({ message: "Not implemented yet" });
};
