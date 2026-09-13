<div align="center">

# 🍳 SmartChef AI

**Your kitchen's smartest sous-chef.**

An AI-powered recipe web app featuring a conversational recipe finder, fridge & pantry vision, full recipe generation, and hands-free voice-guided cooking.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-SmartChef%20AI-8f1c2e?style=flat-square)](https://smartchef-ai-tawny.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-smartchef--ai-8f1c2e?style=flat-square&logo=github)](https://github.com/Nida0526/smartchef-ai)
[![License](https://img.shields.io/badge/license-ISC-blue?style=flat-square)](LICENSE)
![Tech](https://img.shields.io/badge/stack-React%2019%20%2B%20Express%205-8f1c2e?style=flat-square)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 **AI Recipe Chat** | Conversational meal ideas with long-term memory — diet type, allergies, cuisine preferences, and calorie goals (plus recent conversation context) |
| 📷 **Fridge Vision** | Photograph your fridge or pantry; AI identifies the ingredients and suggests recipes you can make right now |
| 📝 **Recipe Generator** | Generates complete recipes — title, macro breakdown, ingredients, and step-by-step instructions — from whatever you have on hand |
| 🎧 **Cook Mode** | Hands-free, step-by-step cooking with voice guidance: smart timers parsed from recipe text, beep + text-to-speech "Time's up", and keyboard shortcuts |
| 🎙️ **Voice Input** | Speak your request instead of typing |
| ⚡ **Quick-Start Chips** | One-tap recipe ideas to get cooking instantly |
| 🔖 **Saved Recipes** | Bookmark and manage your favorites |
| 🔐 **Auth** | JWT-based authentication with bcrypt-hashed passwords |

## 🧱 Tech Stack

- **Frontend:** React 19, Vite 8, React Router 7, lucide-react — white & maroon kitchen-themed UI
- **Backend:** Node.js, Express 5, Mongoose, MongoDB Atlas
- **AI:** Google Gemini `gemini-3.6-flash` (primary), OpenAI (configurable fallback), built-in Demo Mode fallback so the UI never breaks
- **Hosting:** Vercel (serverless function serving UI + API)

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- A Google Gemini API key (or OpenAI key) — add it to `backend/.env`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Nida0526/smartchef-ai.git
cd smartchef-ai

# 2. Install dependencies for root, backend, and frontend
npm install
npm run install:all

# 3. Configure environment variables
cp backend/.env.example backend/.env
# then edit backend/.env and set your GEMINI_API_KEY
```

### Running in development

```bash
npm run dev            # backend → http://localhost:5001  ·  frontend → http://localhost:5173
```

The Vite dev server proxies `/api` requests to the backend automatically.

### Production build

```bash
npm run build          # builds the frontend into frontend/dist
npm start              # NODE_ENV=production → single Express server serves UI + API
```

The production server serves the built frontend at `/` and the API under `/api` (health check: `GET /api/health`).

## 🔑 Demo Accounts

Two accounts are **seeded automatically on every backend start** — so they always work. They're configured in [`backend/seedDemoUser.js`](backend/seedDemoUser.js).

| Name | Email | Password |
|---|---|---|
| Demo Chef | `demo@smartchef.ai` | `smartchef123` |
| Guest User | `guest@smartchef.ai` | `guest1234` |

## 🗂️ Project Structure

```
smartchef-ai/
├── api/                     # Vercel serverless entry point
├── backend/                 # Express API
│   ├── controllers/         # auth + AI logic (chat, vision, recipes, stream)
│   ├── models/              # Mongoose models (User, SavedRecipe, ChatHistory, Preference)
│   ├── routes/              # API route definitions
│   ├── seedDemoUser.js      # seeds demo login accounts on boot
│   ├── app.js               # shared Express app (local server + Vercel function)
│   └── server.js            # local server entry
├── frontend/                # React app
│   ├── public/              # favicon + icons
│   └── src/
│       ├── components/      # Navbar, CookMode, KitchenArt, AuthHero, …
│       ├── pages/           # Dashboard, Generator, SavedRecipes, Login, Register
│       └── lib/             # API client (axios + streaming)
├── README.md
└── DEMO_ACCOUNTS.md
```

## 🌐 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Log in (returns JWT) |
| `POST` | `/api/ai/chat` | Ask for a recipe (single response) |
| `POST` | `/api/ai/chat/stream` | Ask for a recipe (SSE token stream) |
| `GET` | `/api/ai/chat/history` | Chat history |
| `POST` | `/api/ai/vision` | Detect ingredients from a fridge/pantry photo |
| `POST` | `/api/ai/generate-recipe` | Generate a full recipe |
| `GET/POST` | `/api/ai/preferences` | Read / update user preferences |
| `GET/POST/DELETE` | `/api/ai/saved` | Manage saved recipes |
| `GET` | `/api/health` | Health check |

## ⚙️ Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend port | `5000` |
| `MONGODB_URI` | MongoDB connection string | in-memory (`mock_local`) |
| `JWT_SECRET` | Secret used to sign auth tokens | — |
| `GEMINI_API_KEY` | Google Gemini API key | — |
| `GEMINI_MODEL` | Gemini model name | `gemini-3.6-flash` |
| `OPENAI_API_KEY` | Optional OpenAI fallback | `mock_key` |

## 🚢 Deployment

The live demo is deployed on **Vercel** with **MongoDB Atlas** for persistent storage.

To run your own instance:

1. Create a free MongoDB Atlas cluster and set `MONGODB_URI`
2. Deploy `backend/` + built `frontend/dist` to any Node host (Vercel, Render, Railway, Fly.io)
3. Set `NODE_ENV=production`, `PORT`, `JWT_SECRET`, and `GEMINI_API_KEY` on the platform

During local development without `MONGODB_URI`, the app falls back to an in-memory database (`MongoMemoryServer`) — registered accounts and saved data reset on restart, but the two demo accounts are always re-created.

## 📄 License

Released under the [ISC License](https://opensource.org/license/isc).