const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
    createQuiz,
    getQuizzes,
    getQuiz,
    deleteQuiz,
    submitQuiz,
} = require("../controllers/quizController");

// Get & create quizzes
router
    .route("/")
    .get(protect, getQuizzes)
    .post(protect, authorize("creator", "admin"), createQuiz);

// Get & delete single quiz
router
    .route("/:id")
    .get(protect, getQuiz)
    .delete(protect, authorize("creator", "admin"), deleteQuiz);

// ✅ FIXED: Submit quiz (PROTECTED)
router.post("/:id/submit", protect, submitQuiz);

module.exports = router;
