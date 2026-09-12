const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

router.post('/chat', auth, aiController.chat);
router.post('/chat/stream', auth, aiController.chatStream);
router.get('/chat/history', auth, aiController.getChatHistory);
router.delete('/chat/history', auth, aiController.clearChatHistory);
router.post('/vision', auth, aiController.detectIngredients);
router.post('/generate-recipe', auth, aiController.generateRecipes);
router.get('/preferences', auth, aiController.getPreferences);
router.post('/preferences', auth, aiController.updatePreferences);
router.get('/saved', auth, aiController.getSavedRecipes);
router.post('/saved', auth, aiController.saveRecipe);
router.delete('/saved/:id', auth, aiController.deleteRecipe);

module.exports = router;
