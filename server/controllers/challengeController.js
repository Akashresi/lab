const { CodeChallenge, User } = require('../models');

// @desc    Create a new challenge
// @route   POST /api/challenges
// @access  Private (Creator)
exports.createChallenge = async (req, res) => {
    try {
        const { title, description, duration_minutes, start_time, access_code, test_cases, topic, is_ai_generated } = req.body;

        const challenge = await CodeChallenge.create({
            title,
            description,
            duration_minutes,
            start_time,
            access_code,
            test_cases,
            topic,
            is_ai_generated,
            creator_id: req.user.id
        });

        res.status(201).json({ success: true, data: challenge });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Private
exports.getChallenges = async (req, res) => {
    try {
        const challenges = await CodeChallenge.findAll({
            include: [
                { model: User, attributes: ['username'] }
            ],
            order: [['start_time', 'ASC']]
        });
        res.status(200).json({ success: true, count: challenges.length, data: challenges });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single challenge
// @route   GET /api/challenges/:id
// @access  Private
exports.getChallenge = async (req, res) => {
    try {
        const challenge = await CodeChallenge.findByPk(req.params.id);

        if (!challenge) {
            return res.status(404).json({ success: false, error: 'Challenge not found' });
        }

        res.status(200).json({ success: true, data: challenge });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete challenge
// @route   DELETE /api/challenges/:id
// @access  Private
exports.deleteChallenge = async (req, res) => {
    try {
        const challenge = await CodeChallenge.findByPk(req.params.id);

        if (!challenge) {
            return res.status(404).json({ success: false, error: 'Challenge not found' });
        }

        if (challenge.creator_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await challenge.destroy();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
