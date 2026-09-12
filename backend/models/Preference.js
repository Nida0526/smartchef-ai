const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dietType: { type: String, default: 'none' }, // e.g., vegan, keto, paleo
  allergies: [{ type: String }],
  cuisine: [{ type: String }],
  calorieGoal: { type: Number }
});

module.exports = mongoose.model('Preference', preferenceSchema);
