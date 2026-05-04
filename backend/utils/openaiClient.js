const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
const isGroq = apiKey && apiKey.startsWith('gsk_');

const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: isGroq ? 'https://api.groq.com/openai/v1' : undefined
});

module.exports = openai;
