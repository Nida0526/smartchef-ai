const openai = require('../utils/openaiClient');
const Recipe = require('../models/Recipe');
const ChatHistory = require('../models/ChatHistory');
const User = require('../models/User');

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
        // 1. Context Retrieval (User Preferences)
        const user = await User.findById(userId).populate('preferences');
        const userPrefs = user?.preferences || {
            diet: 'None',
            allergies: [],
            calorieGoals: 2000,
            dislikedIngredients: []
        };

        // 2. Long-Term Memory (Recent Chat History)
        const recentHistory = await ChatHistory.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5);

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
        console.log(`🧠 Agent reasoning for user ${userId}`);

        const isGroq = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('gsk_');
        const response = await openai.chat.completions.create({
            model: isGroq ? 'llama-3.3-70b-versatile' : 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `I have these ingredients: ${ingredients.join(', ')}. What should I cook?` }
            ],
            response_format: { type: 'json_object' }
        });

        let recipeData;
        try {
            recipeData = JSON.parse(response.choices[0].message.content);
        } catch (parseError) {
            console.error('JSON Parse Error, attempting to extract JSON block');
            const content = response.choices[0].message.content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                recipeData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('AI returned invalid format');
            }
        }

        // 5. Save to Database (Chat History)
        await ChatHistory.create({
            userId,
            role: 'user',
            content: `Requested recipe for: ${ingredients.join(', ')}`,
            metadata: { ingredients }
        });

        await ChatHistory.create({
            userId,
            role: 'assistant',
            content: `Suggested: ${recipeData.title}`,
            metadata: { recipeGenerated: true }
        });

        // 6. Save to Recipe History
        const savedRecipe = await Recipe.create({
            userId,
            ...recipeData
        });

        res.status(200).json(savedRecipe);

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
    try {
        const history = await Recipe.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch history' });
    }
};

/**
 * @desc    Delete a recipe from history
 * @route   DELETE /api/recipes/history/:id
 * @access  Private
 */
const deleteHistory = async (req, res) => {
    try {
        await Recipe.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        res.status(200).json({ message: 'Recipe removed from history' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete recipe' });
    }
};

module.exports = { generateRecipe, getHistory, deleteHistory };
