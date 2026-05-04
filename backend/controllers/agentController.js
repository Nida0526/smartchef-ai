const openai = require('../utils/openaiClient');

// In-memory stores (works without MongoDB)
const chatHistory = new Map(); // userId -> [{role, content}]
const recipeHistory = new Map(); // userId -> [{recipe, ingredients, timestamp}]
const preferences = new Map(); // userId -> {diet, allergies, ...}

/**
 * @desc    Generate Personalized Recipe (The Agentic Brain)
 * @route   POST /api/recipes/generate
 * @access  Private
 */
const generateRecipe = async (req, res) => {
    const { ingredients } = req.body;
    const userId = req.user._id;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ message: 'Please provide an array of ingredients' });
    }

    try {
        // 1. Context Retrieval (User Preferences) - from memory
        const userPrefs = preferences.get(userId) || {
            diet: 'None',
            allergies: [],
            calorieGoals: 2000,
            dislikedIngredients: []
        };

        // 2. Long-Term Memory (Recent Chat History) - from memory
        const history = chatHistory.get(userId) || [];
        const recentHistory = history.slice(-5);

        // 3. Reasoning & Prompt Construction
        const systemPrompt = `
You are SmartChef AI, a professional nutritionist and chef.
Your goal is to provide a safe, personalized recipe based on the user's specific context.

USER PREFERENCES:
- Diet: ${userPrefs.diet}
- Allergies: ${userPrefs.allergies.join(', ') || 'None'}
- Calorie Goal: ${userPrefs.calorieGoals} kcal
- Disliked Ingredients: ${userPrefs.dislikedIngredients.join(', ') || 'None'}

LONG-TERM MEMORY (Previous Interactions):
${recentHistory.map(h => `${h.role}: ${h.content}`).join('\n') || 'No previous interactions.'}

SHORT-TERM MEMORY (Current Ingredients):
${ingredients.join(', ')}

INSTRUCTIONS:
1. NEVER use any ingredients the user is allergic to.
2. Respect the diet (e.g., no meat for Vegetarians).
3. Aim for a recipe that fits the calorie goal.
4. You MUST respond with ONLY valid JSON in this exact format:
{"title": "Recipe Name", "description": "Brief description", "ingredients": ["item 1", "item 2"], "instructions": ["Step 1", "Step 2"], "calories": 500}
`;

        // 4. Action (AI API Call)
        console.log(`🧠 Agent reasoning for user ${userId} with ingredients: ${ingredients.join(', ')}`);

        const isGroq = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('gsk_');
        const response = await openai.chat.completions.create({
            model: isGroq ? 'llama-3.3-70b-versatile' : 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `I have these ingredients: ${ingredients.join(', ')}. What should I cook?` }
            ],
            response_format: { type: 'json_object' }
        });

        const recipeData = JSON.parse(response.choices[0].message.content);
        console.log(`✅ Recipe generated: ${recipeData.title}`);

        // 5. Update Memory (Save to in-memory history)
        if (!chatHistory.has(userId)) chatHistory.set(userId, []);
        chatHistory.get(userId).push(
            { role: 'user', content: `Requested recipe for: ${ingredients.join(', ')}` },
            { role: 'assistant', content: `Suggested: ${recipeData.title}` }
        );

        // 6. Save to Recipe History
        if (!recipeHistory.has(userId)) recipeHistory.set(userId, []);
        recipeHistory.get(userId).push({
            id: Date.now().toString(),
            recipe: recipeData,
            ingredients: ingredients,
            timestamp: new Date().toISOString()
        });

        res.status(200).json(recipeData);

    } catch (error) {
        console.error('Agent Logic Error:', error.message);
        res.status(500).json({ message: 'AI Agent failed to process request', error: error.message });
    }
};

/**
 * @desc    Get Recipe History
 * @route   GET /api/recipes/history
 * @access  Private
 */
const getHistory = async (req, res) => {
    const userId = req.user._id;
    const history = recipeHistory.get(userId) || [];
    // Return newest first
    res.status(200).json(history.slice().reverse());
};

/**
 * @desc    Delete a recipe from history
 * @route   DELETE /api/recipes/history/:id
 * @access  Private
 */
const deleteHistory = async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    const history = recipeHistory.get(userId) || [];
    const filtered = history.filter(item => item.id !== id);
    recipeHistory.set(userId, filtered);
    res.status(200).json({ message: 'Recipe removed from history' });
};

module.exports = { generateRecipe, getHistory, deleteHistory };
