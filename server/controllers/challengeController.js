const { CodeChallenge, User, ChallengeSubmission } = require('../models');
const { executeCode } = require('../utils/codeExecutor');
const { callAI } = require('../utils/aiHelper');

/**
 * ============================
 * CREATE CODE CHALLENGE
 * ============================
 */
exports.createChallenge = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const {
            title,
            description,
            duration_minutes,
            start_time,
            access_code,
            test_cases,
            topic,
            is_ai_generated,
            difficulty,
            constraints
        } = req.body;

        if (!title || !description || !duration_minutes || !start_time) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const challenge = await CodeChallenge.create({
            title,
            description,
            duration_minutes,
            start_time,
            access_code,
            test_cases: test_cases || [],
            topic,
            is_ai_generated: !!is_ai_generated,
            creator_id: req.user.id,
            difficulty,
            constraints
        });

        res.status(201).json({ success: true, data: challenge });
    } catch (error) {
        console.error('❌ Create Challenge Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * ============================
 * GET ALL CHALLENGES
 * ============================
 */
exports.getChallenges = async (req, res) => {
    try {
        const challenges = await CodeChallenge.findAll({
            include: [{ model: User, attributes: ['username'] }],
            order: [['start_time', 'ASC']]
        });

        res.status(200).json({
            success: true,
            count: challenges.length,
            data: challenges
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * ============================
 * GET SINGLE CHALLENGE
 * ============================
 */
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

/**
 * ============================
 * DELETE CHALLENGE
 * ============================
 */
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

/**
 * ============================
 * RUN CHALLENGE (Test)
 * ============================
 */
exports.runChallenge = async (req, res) => {
    try {
        const { code, language } = req.body;
        const challenge = await CodeChallenge.findByPk(req.params.id);

        if (!challenge) {
            return res.status(404).json({ success: false, error: 'Challenge not found' });
        }

        const testCases = (challenge.test_cases || []).filter(tc => !tc.hidden);
        const results = [];

        for (const tc of testCases) {
            const result = await executeCode(language || 'javascript', code, tc.input);
            const passed = result.status === 'OK' && result.output.trim() === tc.output.trim();

            results.push({
                input: tc.input,
                expected: tc.output,
                actual: result.output,
                error: result.error,
                status: result.status === 'OK' ? (passed ? 'Accepted' : 'Wrong Answer') : result.status,
                execution_time: result.time
            });
        }

        res.status(200).json({ success: true, data: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Execution Error' });
    }
};

/**
 * ============================
 * SUBMIT CODE CHALLENGE
 * ============================
 */
exports.submitChallenge = async (req, res) => {
    try {
        const { code, language } = req.body;
        const challengeId = req.params.id;
        const userId = req.user.id;

        const challenge = await CodeChallenge.findByPk(challengeId);
        if (!challenge) {
            return res.status(404).json({ success: false, error: 'Challenge not found' });
        }

        const testCases = challenge.test_cases || []; // Include hidden types
        let passedCount = 0;

        // Execute against all test cases
        for (const tc of testCases) {
            const result = await executeCode(language || 'javascript', code, tc.input);
            const passed = result.status === 'OK' && result.output.trim() === tc.output.trim();
            if (passed) passedCount++;
        }

        const totalCases = testCases.length;
        const percentage = totalCases > 0 ? Math.round((passedCount / totalCases) * 100) : 0;

        const submission = await ChallengeSubmission.create({
            user_id: userId,
            challenge_id: challengeId,
            code,
            language: language || 'javascript',
            ai_score: percentage
        });

        res.status(200).json({ success: true, data: submission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * getChallengeResults
 */
exports.getChallengeResults = async (req, res) => {
    try {
        const challenge = await CodeChallenge.findByPk(req.params.id);
        if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

        if (challenge.creator_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const results = await ChallengeSubmission.findAll({
            where: { challenge_id: req.params.id },
            include: [{ model: User, attributes: ['username', 'email'] }],
            order: [['submitted_at', 'DESC']]
        });

        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};
