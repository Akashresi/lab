const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    generateInterview,
    submitInterview,
    getInterview
} = require('../controllers/interviewController');

router.post('/generate', protect, generateInterview);
router.post('/:id/submit', protect, submitInterview);
router.get('/:id/result', protect, getInterview);

module.exports = router;
