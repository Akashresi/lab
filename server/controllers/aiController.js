const fetch = require('node-fetch'); // Ensure node-fetch is available or use global fetch in Node 18+

// Helper to call AI API
const callAI = async (prompt) => {
    // Check if key is for Google (AIza...) or OpenAI (sk-...)
    const apiKey = process.env.AI_API_KEY;

    // Mock response if no key (for development stability)
    if (!apiKey) {
        console.warn('No AI_API_KEY found. Using mock response.');
        return null;
    }

    if (apiKey.startsWith('AIza')) {
        // Google Gemini
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.candidates[0].content.parts[0].text;
    }

    // Fallback or OpenAI implementation would go here
    return null;
};

// @desc    Generate Quiz Questions
// @route   POST /api/ai/generate-quiz
exports.generateQuiz = async (req, res) => {
    const { topic, difficulty, count } = req.body;

    try {
        const prompt = `Generate ${count} multiple-choice questions about "${topic}" at ${difficulty} difficulty. 
        Return strictly valid JSON array (no markdown) with objects having: "text", "options" (array of 4 strings), "correct_index" (0-3).`;

        let result = await callAI(prompt);
        let questions;

        if (result) {
            // Clean markdown if present
            result = result.replace(/```json/g, '').replace(/```/g, '').trim();
            questions = JSON.parse(result);
        } else {
            // Mock Fallback
            questions = Array.from({ length: count }).map((_, i) => ({
                text: `Mock Question ${i + 1} about ${topic} (${difficulty})`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correct_index: 0
            }));
        }

        res.status(200).json({ success: true, data: questions });
    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ success: false, error: 'AI Generation Failed' });
    }
};

// @desc    Generate Code Challenge
// @route   POST /api/ai/generate-challenge
exports.generateChallenge = async (req, res) => {
    const { topic, difficulty } = req.body;

    try {
        const prompt = `Generate a coding challenge about "${topic}" at ${difficulty} level.
        Return strictly valid JSON (no markdown) with:
        "title", "description", "test_cases" (array of {input, output, hidden: boolean}).`;

        let result = await callAI(prompt);
        let challenge;

        if (result) {
            result = result.replace(/```json/g, '').replace(/```/g, '').trim();
            challenge = JSON.parse(result);
        } else {
            challenge = {
                title: `${topic} Challenge`,
                description: `Write a function to solve ${topic}...`,
                test_cases: [{ input: "1", output: "1", hidden: false }]
            };
        }

        res.status(200).json({ success: true, data: challenge });
    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ success: false, error: 'AI Generation Failed' });
    }
};

// @desc    Generate Interview Questions
// @route   POST /api/ai/generate-interview
exports.generateInterview = async (req, res) => {
    const { topic, level } = req.body;

    try {
        const prompt = `Generate 5 interview questions for a ${level} developer regarding "${topic}".
        Return strictly valid JSON array (no markdown) of strings.`;

        let result = await callAI(prompt);
        let questions;

        if (result) {
            result = result.replace(/```json/g, '').replace(/```/g, '').trim();
            questions = JSON.parse(result);
        } else {
            questions = [
                `Explain ${topic} in your own words.`,
                `What are the pros and cons of ${topic}?`,
                `How would you scale a system using ${topic}?`
            ];
        }

        res.status(200).json({ success: true, data: questions });
    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ success: false, error: 'AI Generation Failed' });
    }
};
