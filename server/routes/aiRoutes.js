// server/routes/aiRoutes.js

const express = require("express");
const router = express.Router();

// ⚠️ Make auth optional for AI (prevents silent failures during dev)
let protect;
try {
    protect = require("../middleware/authMiddleware").protect;
} catch {
    protect = null;
}

const {
    generateQuiz,
    generateChallenge,
    generateInterview,
} = require("../controllers/aiController");

/**
 * ================================
 * AI ROUTES
 * ================================
 * In development, routes work even without auth
 * In production, protect middleware is applied
 */

// Helper to conditionally apply auth
const withAuth = (handler) =>
    protect ? [protect, handler] : handler;

// Generate Quiz
router.post("/generate-quiz", withAuth(generateQuiz));

// Generate Coding Challenge
router.post("/generate-challenge", withAuth(generateChallenge));

// Generate Interview Questions
router.post("/generate-interview", withAuth(generateInterview));

module.exports = router;
