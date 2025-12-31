const express = require('express');
const { getResults, exportResults } = require('../controllers/resultController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All result routes are protected

router.get('/', getResults);
router.get('/export', exportResults);

module.exports = router;
