const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createChallenge,
    getChallenges,
    getChallenge,
    deleteChallenge,
    submitChallenge,
    runChallenge
} = require('../controllers/challengeController');

router.route('/')
    .get(protect, getChallenges)
    .post(protect, authorize('creator', 'admin'), createChallenge);

router.route('/:id')
    .get(protect, getChallenge)
    .delete(protect, authorize('creator', 'admin'), deleteChallenge);

// ✅ FIXED: protect submit & run routes
router.post('/:id/submit', protect, submitChallenge);
router.post('/:id/run', protect, runChallenge);

module.exports = router;
