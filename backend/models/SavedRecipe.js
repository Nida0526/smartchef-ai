const mongoose = require('mongoose');

const savedRecipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  ingredients: [{ type: String, required: true }],
  instructions: [{ type: String, required: true }],
  savedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedRecipe', savedRecipeSchema);
