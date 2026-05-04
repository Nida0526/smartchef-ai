const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    metadata: {
        ingredients: [{ type: String }],
        recipeGenerated: { type: Boolean, default: false }
    }
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
