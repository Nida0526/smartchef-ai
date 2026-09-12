# SmartChef AI

Your kitchen's smartest sous-chef. An AI-powered recipe web app with conversation, fridge vision, and voice-guided cooking.

## Live Demo

**https://carrier-fitted-particle-jar.trycloudflare.com**

> The demo runs from a temporary Cloudflare tunnel to a local server. Log in with:

| Name        | Email                | Password       |
|-------------|----------------------|----------------|
| Demo Chef   | `demo@smartchef.ai`  | `smartchef123` |
| Guest User  | `guest@smartchef.ai` | `guest1234`    |

These demo accounts are seeded automatically on every backend start (see `backend/seedDemoUser.js` and `DEMO_ACCOUNTS.md`).

## Features

- **AI Recipe Chat** — chat with Gemini for meal ideas, with long-term memory (diet type, allergies, cuisines, calorie goals) and recent chat context
- **Fridge Vision** — snap a photo of your fridge/pantry and AI detects ingredients and suggests recipes
- **Recipe Generator** — generate complete recipes (title, macros, ingredients, instructions) from whatever you have
- **Cook Mode** — hands-free step-by-step cooking with voice guidance, smart timers parsed from recipe text, beeps + text-to-speech "Time's up", and keyboard controls
- **Voice Input** — speak your request instead of typing
- **Quick-Start Chips** — one-tap recipe ideas to get cooking instantly
- **Saved Recipes** — bookmark and organize your favorites
- **Auth** — register/login with JWT, bcrypt-hashed passwords

## Tech Stack

- **Frontend:** React 19 + Vite, React Router, lucide-react (white & maroon kitchen-themed UI)
- **Backend:** Node.js + Express 5, Mongoose, MongoDB (in-memory by default, swap via `MONGODB_URI`)
- **AI:** Google Gemini (`gemini-3.6-flash`) with OpenAI fallback; graceful demo-mode fallback if no key is configured

## Getting Started

```bash
# install dependencies (root, backend, frontend)
npm install && npm run install:all

# create the backend env file
cp backend/.env.example backend/.env
# add your GEMINI_API_KEY to backend/.env

# run in development (backend :5001 + frontend :5173)
npm run dev

# build + run in production (single server serves the frontend + API)
npm run build
npm start   # NODE_ENV=production node backend/server.js
```

The production server serves the built frontend at `/` and the API under `/api` (health check: `GET /api/health`).

## Project Structure

```
backend/            Express server: auth routes, AI controller, models, seed script
frontend/src        React app: pages, components (CookMode, KitchenArt, AuthHero), API client
frontend/public     favicon + icons
DEMO_ACCOUNTS.md    Seeded demo login credentials
```

**Note:** the default database is in-memory (`MongoMemoryServer`), so self-registered accounts and saved data reset on restart — seeded demo accounts are always re-created. Set `MONGODB_URI` to a persistent database (e.g., MongoDB Atlas) for a permanent deployment.

## License

ISC