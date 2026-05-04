const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    ingredients: [{ type: String }],
    instructions: [{ type: String }],
    calories: { type: Number },
    prepTime: { type: String, default: '25m' },
    difficulty: { type: String, default: 'Medium' }
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
