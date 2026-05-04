const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    allergies: [{ type: String }],
    diet: { type: String, enum: ['None', 'Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Gluten-Free'], default: 'None' },
    calorieGoals: { type: Number, default: 2000 },
    dislikedIngredients: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Preference', preferenceSchema);
