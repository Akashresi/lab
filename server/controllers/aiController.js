const { callAI } = require('../utils/aiHelper');

// Node 18+ has global fetch, fallback for older versions
// (fetch handling inside aiHelper now)
let fetchFn;
try {
    fetchFn = fetch;
} catch {
    fetchFn = require("node-fetch");
}

// function imported from utils/aiHelper

/**
 * ================================
 * GENERATE QUIZ
 * ================================
 */
exports.generateQuiz = async (req, res) => {
    const { topic = "General Knowledge", difficulty = "easy", count = 5 } = req.body;

    try {
        const prompt = `
Generate ${count} multiple-choice questions on "${topic}" (${difficulty}).
Return ONLY valid JSON array (no markdown).
Each object:
{
  "text": "question",
  "options": ["A","B","C","D"],
  "correct_index": 0
}
`;

        let result = await callAI(prompt);
        let questions;

        if (result) {
            result = result.replace(/```json|```/g, "").trim();
            questions = JSON.parse(result);
        } else {
            questions = Array.from({ length: count }).map((_, i) => ({
                text: `Mock Question ${i + 1} about ${topic}`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correct_index: 0,
            }));
        }

        res.json({ success: true, data: questions });
    } catch (error) {
        console.error("❌ AI Quiz Error:", error.message);
        res.json({
            success: true,
            data: Array.from({ length: count }).map((_, i) => ({
                text: `Mock Question ${i + 1} about ${topic}`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correct_index: 0,
            })),
        });
    }
};

/**
 * ================================
 * GENERATE CODE CHALLENGE
 * ================================
 */
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
            result = result.replace(/```json|```/g, "").trim();
            challenge = JSON.parse(result);
        } else {
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

/**
 * ================================
 * GENERATE INTERVIEW QUESTIONS
 * ================================
 */
exports.generateInterview = async (req, res) => {
    const { topic = "JavaScript", level = "junior" } = req.body;

    try {
        const prompt = `
Generate 5 interview questions for a ${level} developer on "${topic}".
Return ONLY valid JSON array of strings.
`;

        let result = await callAI(prompt);
        let questions;

        if (result) {
            result = result.replace(/```json|```/g, "").trim();
            questions = JSON.parse(result);
        } else {
            questions = [
                `What is ${topic}?`,
                `Why is ${topic} important?`,
                `Explain a real-world use case of ${topic}.`,
                `What are common mistakes in ${topic}?`,
                `How do you improve performance using ${topic}?`,
            ];
        }

        res.json({ success: true, data: questions });
    } catch (error) {
        console.warn("⚠️ AI Interview fallback used.");
        res.json({
            success: true,
            data: [
                `What is ${topic}?`,
                `Why is ${topic} important?`,
                `Explain a real-world use case of ${topic}.`,
                `What are common mistakes in ${topic}?`,
                `How do you improve performance using ${topic}?`,
            ],
        });
    }
};
