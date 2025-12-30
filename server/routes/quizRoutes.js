const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createQuiz, getQuizzes, getQuiz, deleteQuiz } = require('../controllers/quizController');

router.route('/')
    .get(protect, getQuizzes)
    .post(protect, authorize('creator', 'admin'), createQuiz);

router.route('/:id')
    .get(protect, getQuiz)
    .delete(protect, authorize('creator', 'admin'), deleteQuiz);

module.exports = router;
