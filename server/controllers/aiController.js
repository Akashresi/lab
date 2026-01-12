const { callAI } = require('../utils/aiHelper');

// Node 18+ has global fetch, fallback for older versions
let fetchFn;
try {
    fetchFn = fetch;
} catch {
    fetchFn = require("node-fetch");
}

exports.generateQuiz = async (req, res) => {
    const { topic = "General Knowledge", difficulty = "easy", count = 5 } = req.body;

    try {
        const prompt = `
Generate ${count} multiple-choice questions on "${topic}".
Difficulty: ${difficulty}

Return strict JSON:
[
  {
    "text": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Brief explanation"
  }
]
`;

        let result = await callAI(prompt);
        let questions;

        if (result) {
            try {
                result = result.replace(/```json|```/g, "").trim();
                questions = JSON.parse(result);
            } catch (e) {
                // simple fallback if parse fails
                console.warn("AI JSON parse failed, falling back to mocks");
                questions = null;
            }
        }


        if (!questions) {
            questions = Array.from({ length: count }).map((_, i) => ({
                text: `Mock Question ${i + 1} about ${topic}`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correct_index: 0,
                explanation: "Mock explanation"
            }));
        }

        res.json({ success: true, data: questions });
    } catch (error) {
        console.error("❌ AI Quiz Error:", error.message);
        res.status(500).json({ success: false, error: 'AI Generation Failed' });
    }
};

exports.generateChallenge = async (req, res) => {
    const { topic = "Arrays", difficulty = "easy" } = req.body;

    try {
        const prompt = `
Generate a coding challenge on "${topic}" (${difficulty}).
Return ONLY valid JSON:
{
  "title": "",
  "description": "",
  "test_cases": [
    { "input": "", "output": "", "hidden": false }
  ]
}
`;

        let result = await callAI(prompt);
        let challenge;

        if (result) {
            try {
                result = result.replace(/```json|```/g, "").trim();
                challenge = JSON.parse(result);
            } catch (e) { }
        }

        if (!challenge) {
            challenge = {
                title: `${topic} Challenge`,
                description: `Solve a basic problem related to ${topic}.`,
                test_cases: [{ input: "1", output: "1", hidden: false }],
            };
        }

        res.json({ success: true, data: challenge });
    } catch (error) {
        console.warn("⚠️ AI Challenge fallback used.");
        res.json({
            success: true,
            data: {
                title: `${topic} Challenge`,
                description: `Solve a basic problem related to ${topic}.`,
                test_cases: [{ input: "1", output: "1", hidden: false }],
            },
        });
    }
};

exports.generateInterview = async (req, res) => {
    const { topic = "JavaScript", level = "junior" } = req.body;

    try {
        const prompt = `
Generate 5 interview questions for a ${level} developer on "${topic}".
Return ONLY valid JSON array of objects.
Each object must match this schema:
{
  "type": "interactive",
  "text": "The question text",
  "semantic_answer": "A brief summary of the ideal answer keywords or concepts",
  "options": [],
  "correct_index": -1
}
`;

        let result = await callAI(prompt);
        let questions;

        if (result) {
            try {
                result = result.replace(/```json|```/g, "").trim();
                questions = JSON.parse(result);
            } catch (e) { }
        }

        if (!questions) {
            questions = [
                { type: 'interactive', text: `What is ${topic}?`, semantic_answer: `${topic} is...`, options: [], correct_index: -1 },
                { type: 'interactive', text: `Why is ${topic} important?`, semantic_answer: "It allows...", options: [], correct_index: -1 },
                { type: 'interactive', text: `Explain a real-world use case of ${topic}.`, semantic_answer: "Example...", options: [], correct_index: -1 },
                { type: 'interactive', text: `What are common mistakes in ${topic}?`, semantic_answer: "Common mistakes", options: [], correct_index: -1 },
                { type: 'interactive', text: `How do you improve performance using ${topic}?`, semantic_answer: "Optimization", options: [], correct_index: -1 },
            ];
        }

        res.json({ success: true, data: questions });
    } catch (error) {
        console.warn("⚠️ AI Interview fallback used.");
        res.json({
            success: true,
            data: [
                { type: 'interactive', text: `What is ${topic}?`, semantic_answer: "Concept", options: [], correct_index: -1 }
            ]
        });
    }
};
exports.evaluateAnswer = async (req, res) => {
    const { question, answer, context } = req.body;

    try {
        const prompt = `
        You are an expert technical interviewer.
        Question: "${question}"
        Context/Ideal Answer Keys: "${context}"
        Candidate Answer: "${answer}"

        Evaluate the answer on:
        1. Correctness (Pass/Fail)
        2. Depth (1-10)
        3. Clarity (1-10)

        Return ONLY valid JSON:
        {
          "isCorrect": boolean,
          "score": number,
          "feedback": "Constructive feedback",
          "idealAnswer": "Better version of the answer"
        }
        `;

        let result = await callAI(prompt);
        let evaluation;

        if (result) {
            try {
                result = result.replace(/```json|```/g, "").trim();
                evaluation = JSON.parse(result);
            } catch (e) { console.error("JSON Parse Error", e); }
        }

        if (!evaluation) {
            evaluation = {
                isCorrect: true,
                score: 7,
                feedback: "Good attempt, but could be more specific.",
                idealAnswer: context || "Standard textbook answer."
            };
        }

        res.json({ success: true, data: evaluation });
    } catch (error) {
        console.error("AI Eval Error:", error);
        res.status(500).json({ success: false, error: 'Evaluation failed' });
    }
};
