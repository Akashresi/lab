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
Generate ${count} questions on "${topic}" (${difficulty}).
Mix "mcq" (Multiple Choice) and "interactive" (Typed Answer) types.
Return ONLY valid JSON array.
Each object format:
For MCQ:
{
  "type": "mcq",
  "text": "question",
  "options": ["A","B","C","D"],
  "correct_index": 0,
  "explanation": "why correct"
}
For Interactive:
{
  "type": "interactive",
  "text": "question",
  "options": [],
  "correct_index": -1,
  "semantic_answer": "correct answer concept",
  "explanation": "explanation"
}
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
                type: i % 2 === 0 ? 'mcq' : 'interactive',
                text: `Mock Question ${i + 1} about ${topic}`,
                options: i % 2 === 0 ? ["Option A", "Option B", "Option C", "Option D"] : [],
                correct_index: i % 2 === 0 ? 0 : -1,
                semantic_answer: i % 2 === 0 ? null : "Target Answer",
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
