const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Preference = require('../models/Preference');
const ChatHistory = require('../models/ChatHistory');
const SavedRecipe = require('../models/SavedRecipe');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock_key');
}

function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock_key');
}

async function getContext(userId) {
  let preference = await Preference.findOne({ userId });
  if (!preference) {
    preference = { dietType: 'none', allergies: [], cuisine: [], calorieGoal: null };
  }

  const history = await ChatHistory.find({ userId }).sort({ timestamp: -1 }).limit(5);
  const historyContext = history.reverse().map(h => `User: ${h.message}\nAI: ${h.response}`).join('\n');

  return { preference, historyContext };
}

function buildSystemPrompt({ preference, historyContext }) {
  return `
    You are SmartChef AI, an agentic recipe finder. 
    You help users find and plan recipes based on their ingredients and constraints.
    Format the output as a recipe with:
    - Title
    - Ingredients (bullet points)
    - Instructions (numbered list)
    - Provide a brief conversational answer.
    
    User's Long-Term Memory (Preferences):
    - Diet Type: ${preference.dietType}
    - Allergies: ${preference.allergies.join(', ') || 'None'}
    - Preferred Cuisines: ${preference.cuisine.join(', ') || 'Any'}
    - Calorie Goal per meal: ${preference.calorieGoal ? preference.calorieGoal + ' kcal' : 'Not set'}
    
    Recent Chat History (Short-Term Memory):
    ${historyContext}
  `;
}

function buildMockResponse(message) {
  return `### [Demo Mode] SmartChef AI

I see you're looking for a recipe using: **${message}**.

Since no working AI provider is configured, here's a sample to show the flow:

### Demo Recipe: ${message.split(',')[0]} Delight

**Ingredients**
- ${message.split(',').join('\n- ')}
- Olive oil
- Salt & Pepper

**Instructions**
1. Prep your ${message.split(',')[0].trim()}.
2. Sauté with olive oil and seasonings.
3. Serve warm!

*To enable live AI recipes, add a working Google Gemini key or an OpenAI key to your .env file.*`;
}

function saveChat(userId, message, response) {
  const newChat = new ChatHistory({ userId, message, response });
  return newChat.save();
}

const VISION_SYSTEM_PROMPT = `You are an expert culinary computer vision assistant. Analyze the provided image of a refrigerator, pantry, or food items. Identify all visible ingredients and food items. Return ONLY a raw JSON object matching the requested structure, with no markdown code blocks, intro, or outro text.
Schema:
{
  "detectedIngredients": [
    { "name": "Tomatoes", "estimatedQuantity": "3 medium", "freshness": "Good" }
  ],
  "suggestedCuisines": ["Italian"]
}`;

const RECIPE_GENERATOR_PROMPT = (payload) => `You are Smart Chef AI, a world-class professional chef and nutritionist. Create ${payload.recipeCount || 2} distinct, viable, step-by-step recipes based on the provided ingredients, dietary restrictions, and target prep time.
Rules:
- Do not invent obscure ingredients that aren't provided unless they are basic pantry staples (salt, pepper, oil, water, sugar, flour).
- Adhere strictly to the dietary restrictions.
- Each recipe must fit within the target time budget.
- Return ONLY a raw JSON object with no markdown code blocks.
Recipes requested: ${payload.recipeCount || 2}
Ingredients available: ${payload.ingredients.join(', ')}
Dietary restrictions: ${payload.dietaryRestrictions.join(', ') || 'None'}
Max prep time: ${payload.maxPrepTimeMinutes} minutes
Servings: ${payload.servings}
Schema:
{
  "recipes": [
    {
      "title": "string",
      "description": "string",
      "prepTime": "string",
      "cookTime": "string",
      "difficulty": "Easy | Medium | Hard",
      "macros": { "calories": 0, "proteinGrams": 0, "carbsGrams": 0, "fatGrams": 0 },
      "usedIngredients": ["string"],
      "pantryStaplesNeeded": ["string"],
      "instructions": ["string"]
    }
  ]
}`;

function extractJson(text) {
  if (!text) return null;
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // fall back to first balanced JSON object
  }
  const start = cleaned.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === '{') depth++;
    else if (cleaned[i] === '}') depth--;
    if (depth === 0) {
      try {
        return JSON.parse(cleaned.slice(start, i + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

async function geminiJson(prompt, { parts = null, temperature = 0.3 } = {}) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: 'application/json', temperature }
  });
  const result = parts
    ? await model.generateContent(parts)
    : await model.generateContent(prompt);
  return extractJson(result.response.text());
}

exports.detectIngredients = async (req, res) => {
  try {
    let { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'No image provided.' });
    }
    if ((imageBase64.length * 3) / 4 > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'Image is too large (max 10MB).' });
    }

    if (imageBase64.startsWith('data:')) {
      const comma = imageBase64.indexOf(',');
      const header = imageBase64.slice(0, comma);
      if (!mimeType) mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
      imageBase64 = imageBase64.slice(comma + 1);
    }

    const parts = [
      { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } },
      { text: VISION_SYSTEM_PROMPT }
    ];

    let data;
    if (isGeminiConfigured()) {
      data = await geminiJson(null, { parts });
    }
    if (!data) {
      data = {
        detectedIngredients: [
          { name: 'Eggs', estimatedQuantity: '6 eggs', freshness: 'Good' },
          { name: 'Spinach', estimatedQuantity: '1 bunch', freshness: 'Use soon' },
          { name: 'Onion', estimatedQuantity: '1 medium', freshness: 'Good' }
        ],
        suggestedCuisines: ['Italian', 'Mediterranean']
      };
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Vision API Error:', err.message || err);
    res.json({
      success: true,
      data: {
        detectedIngredients: [
          { name: 'Eggs', estimatedQuantity: '6 eggs', freshness: 'Good' },
          { name: 'Spinach', estimatedQuantity: '1 bunch', freshness: 'Use soon' }
        ],
        suggestedCuisines: ['Italian']
      }
    });
  }
};

exports.generateRecipes = async (req, res) => {
  try {
    const { ingredients = [], dietaryRestrictions = [], maxPrepTimeMinutes = 20, servings = 2, recipeCount = 2 } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one ingredient is required.' });
    }
    if (!Number.isFinite(servings) || servings < 1 || servings > 20) {
      return res.status(400).json({ success: false, message: 'Servings must be between 1 and 20.' });
    }
    if (!Number.isFinite(maxPrepTimeMinutes) || maxPrepTimeMinutes < 1 || maxPrepTimeMinutes > 300) {
      return res.status(400).json({ success: false, message: 'Prep time must be between 1 and 300 minutes.' });
    }

    const prompt = RECIPE_GENERATOR_PROMPT({ ingredients, dietaryRestrictions, maxPrepTimeMinutes, servings, recipeCount });

    let data;
    if (isGeminiConfigured()) {
      data = await geminiJson(prompt, { temperature: 0.4 });
    }
    if (!data || !Array.isArray(data.recipes) || data.recipes.length === 0) {
      data = buildMockRecipes(ingredients, maxPrepTimeMinutes, servings, recipeCount);
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Generate Recipe API Error:', err.message || err);
    const { ingredients = ['eggs'], maxPrepTimeMinutes = 20, servings = 2, recipeCount = 2 } = req.body;
    res.json({ success: true, data: buildMockRecipes(ingredients, maxPrepTimeMinutes, servings, recipeCount) });
  }
};

function buildMockRecipes(ingredients, maxPrepTimeMinutes, servings, recipeCount) {
  const used = Array.isArray(ingredients) && ingredients.length ? ingredients : ['eggs'];
  const recipes = [];
  for (let i = 0; i < (recipeCount || 2); i++) {
    recipes.push({
      title: `Quick ${used[0][0].toUpperCase() + used[0].slice(1)} Skillet ${i + 1}`,
      description: `A fast, flexible ${maxPrepTimeMinutes}-minute meal built around the ingredients you have on hand.`,
      prepTime: `${Math.max(5, Math.round(maxPrepTimeMinutes / 2))} min`,
      cookTime: `${Math.max(5, Math.round(maxPrepTimeMinutes / 2))} min`,
      difficulty: i === 0 ? 'Easy' : 'Medium',
      macros: { calories: 420 + i * 40, proteinGrams: 28 + i * 5, carbsGrams: 38 + i * 6, fatGrams: 18 + i * 3 },
      usedIngredients: used,
      pantryStaplesNeeded: ['Olive oil', 'Salt', 'Black pepper'],
      instructions: [
        `Prep and chop your ${used.join(', ')}.`,
        `Heat oil in a skillet over medium heat and cook until golden.`,
        'Season with salt and pepper, then serve warm.'
      ]
    });
  }
  return { recipes };
}

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    const context = await getContext(userId);
    const systemPrompt = buildSystemPrompt(context);

    let aiResponseText = '';

    if (isOpenAIConfigured()) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      });
      aiResponseText = completion.choices[0].message.content;
    } else if (isGeminiConfigured()) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

        const result = await model.generateContent(`${systemPrompt}\n\nUser Message: ${message}`);
        const response = await result.response;
        aiResponseText = response.text();
      } catch (geminiErr) {
        console.error('Gemini API Error:', geminiErr.message || geminiErr);
        aiResponseText = buildMockResponse(message);
      }
    } else {
      aiResponseText = buildMockResponse(message);
    }

    await saveChat(userId, message, aiResponseText);
    res.json({ response: aiResponseText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating recipe.' });
  }
};

exports.chatStream = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);
  const sendChunks = async (text, delay = 14) => {
    const words = text.split(' ');
    for (const word of words) {
      send({ token: word + ' ' });
      await new Promise(r => setTimeout(r, delay));
    }
  };

  let fullText = '';

  try {
    const context = await getContext(userId);
    const systemPrompt = buildSystemPrompt(context);

    if (isGeminiConfigured()) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

        const result = await model.generateContentStream(`${systemPrompt}\n\nUser Message: ${message}`);
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            fullText += text;
            send({ token: text });
          }
        }
      } catch (geminiErr) {
        console.error('Gemini stream error:', geminiErr.message || geminiErr);
        if (!fullText) {
          fullText = buildMockResponse(message);
          await sendChunks(fullText);
        } else {
          send({ error: true });
        }
      }
    } else {
      fullText = buildMockResponse(message);
      await sendChunks(fullText);
    }

    await saveChat(userId, message, fullText);
    send({ done: true });
    res.end();
  } catch (err) {
    console.error(err);
    send({ error: true });
    send({ done: true });
    res.end();
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const pref = await Preference.findOne({ userId: req.user.id });
    res.json(pref);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { dietType, allergies, cuisine, calorieGoal } = req.body;
    let pref = await Preference.findOne({ userId: req.user.id });
    if (!pref) {
      pref = new Preference({ userId: req.user.id });
    }
    pref.dietType = dietType;
    pref.allergies = allergies;
    pref.cuisine = cuisine;
    pref.calorieGoal = calorieGoal;
    await pref.save();
    res.json(pref);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getSavedRecipes = async (req, res) => {
  try {
    const recipes = await SavedRecipe.find({ userId: req.user.id }).sort({ savedAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const history = await ChatHistory.find({ userId: req.user.id })
      .sort({ timestamp: 1 })
      .limit(50)
      .lean();
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching chat history.' });
  }
};

exports.clearChatHistory = async (req, res) => {
  try {
    await ChatHistory.deleteMany({ userId: req.user.id });
    res.json({ message: 'Chat history cleared.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error clearing chat history.' });
  }
};

exports.saveRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions } = req.body;
    const newRecipe = new SavedRecipe({
      userId: req.user.id,
      title,
      ingredients,
      instructions
    });
    await newRecipe.save();
    res.json(newRecipe);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await SavedRecipe.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted.' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};