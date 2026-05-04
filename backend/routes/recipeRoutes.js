const express = require('express');
const router = express.Router();
const { generateRecipe, getHistory, deleteHistory } = require('../controllers/agentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateRecipe);
router.get('/history', protect, getHistory);
router.delete('/history/:id', protect, deleteHistory);

module.exports = router;
