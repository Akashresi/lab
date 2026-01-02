const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
    createQuiz,
    getQuizzes,
    getQuiz,
    deleteQuiz,
    submitQuiz,
    getQuizResults,
    exportQuizResults
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

// Submit quiz
router.post("/:id/submit", protect, submitQuiz);

// Results & Export (Creator only)
router.get("/:id/results", protect, authorize("creator", "admin"), getQuizResults);
router.get("/:id/export", protect, authorize("creator", "admin"), exportQuizResults);

module.exports = router;
