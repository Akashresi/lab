const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateQuiz, generateChallenge, generateInterview } = require('../controllers/aiController');

router.post('/generate-quiz', protect, generateQuiz);
router.post('/generate-challenge', protect, generateChallenge);
router.post('/generate-interview', protect, generateInterview);

module.exports = router;
