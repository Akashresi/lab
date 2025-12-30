const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createChallenge, getChallenges, getChallenge, deleteChallenge } = require('../controllers/challengeController');

router.route('/')
    .get(protect, getChallenges)
    .post(protect, authorize('creator', 'admin'), createChallenge);

router.route('/:id')
    .get(protect, getChallenge)
    .delete(protect, authorize('creator', 'admin'), deleteChallenge);

module.exports = router;
