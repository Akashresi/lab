const { InterviewQuestion, InterviewSubmission, User } = require('../models');
const { callAI } = require('../utils/aiHelper');

// @desc    Generate a new interview question
// @route   POST /api/interviews/generate
// @access  Private
exports.generateInterview = async (req, res) => {
    try {
        const { role, topic, difficulty } = req.body;

        if (!role || !topic) {
            return res.status(400).json({ error: 'Role and Topic are required' });
        }

        const prompt = `
        Generate a single technical interview question for a ${difficulty || 'medium'} level ${role} position focusing on ${topic}.
        The question should be conceptual or scenario-based, requiring a descriptive answer.
        Return ONLY the question text.
        `;

        const questionText = await callAI(prompt);
        if (!questionText) {
            return res.status(500).json({ error: 'Failed to generate question' });
        }

        const question = await InterviewQuestion.create({
            role,
            topic,
            difficulty: difficulty || 'medium',
            question: questionText.replace(/^"|"$/g, '').trim() // Clean quotes
        });

        res.status(201).json({ success: true, data: question });

    } catch (error) {
        console.error("AI Generate Error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Submit answer for evaluation
// @route   POST /api/interviews/:id/submit
// @access  Private
exports.submitInterview = async (req, res) => {
    try {
        const { answer } = req.body;
        const questionId = req.params.id;
        const userId = req.user.id;

        const question = await InterviewQuestion.findByPk(questionId);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // AI Evaluation
        const evalPrompt = `
        Evaluate this interview answer.
        Role: ${question.role}
        Question: "${question.question}"
        Candidate Answer: "${answer}"

        Provide a JSON response:
        {
            "score": (0-100 integer),
            "feedback": "Constructive feedback...",
            "ideal_answer": "Brief summary of key points missing or good points made"
        }
        `;

        const aiRes = await callAI(evalPrompt);
        let feedback = "Analysis failed";
        let score = 0;

        try {
            // Clean markdown code blocks if AI wraps JSON
            const cleanJson = aiRes.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            score = parsed.score;
            feedback = `${parsed.feedback}\n\n**Ideal Answer Key:** ${parsed.ideal_answer}`;
        } catch (e) {
            console.error("AI Parse Error", e);
            feedback = aiRes; // Fallback to raw text
        }

        const submission = await InterviewSubmission.create({
            question_id: questionId,
            user_id: userId,
            answer,
            ai_score: score,
            ai_feedback: feedback
        });

        res.status(200).json({ success: true, data: submission });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get interview result
// @route   GET /api/interviews/:id/result
// @access  Private
exports.getInterview = async (req, res) => {
    try {
        const submission = await InterviewSubmission.findOne({
            where: { question_id: req.params.id, user_id: req.user.id },
            include: [{ model: InterviewQuestion }]
        });

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        res.status(200).json({ success: true, data: submission });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
