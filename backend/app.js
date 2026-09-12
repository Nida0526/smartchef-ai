const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

process.env.MONGOMS_DEBUG = '1';

const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedDemoUsers } = require('./seedDemoUser');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 5000;

let dbConnectionPromise = null;

async function ensureDBConnection() {
  if (mongoose.connection.readyState === 1) return;
  if (dbConnectionPromise) return dbConnectionPromise;

  dbConnectionPromise = (async () => {
    let uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri || uri === 'mock_local') {
      console.log('No MongoDB URI found, starting in-memory database...');
      // Reuse the binary pre-downloaded during the build (see backend/download-mongod.js).
      // Try dist copy first (bundled on Vercel), fall back to backend/.cache (local dev).
      const cacheCandidates = [
        path.join(__dirname, '..', 'frontend', 'dist', '.cache'),
        path.join(__dirname, '.cache'),
      ];
      const cacheDir = cacheCandidates.find((p) => { try { return fs.existsSync(p); } catch { return false; } }) || cacheCandidates[1];
      process.env.MONGOMS_DOWNLOAD_DIR = cacheDir;
      process.env.MONGOMS_CACHE_DIR = cacheDir;
      console.log('Using mongod cache:', cacheDir);
      const mongoServer = await MongoMemoryServer.create({
        binary: { downloadDir: cacheDir }
      });
      uri = mongoServer.getUri();
    }

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log(`Connected to MongoDB: ${uri.replace(/\/\/.*@/, '//***@')}`);
    await seedDemoUsers();
  })();

  try {
    await dbConnectionPromise;
  } catch (err) {
    dbConnectionPromise = null;
    throw err;
  }
  return dbConnectionPromise;
}

// Health check (public, no database required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SmartChef AI', time: new Date().toISOString() });
});

// Serve the built frontend (production / Vercel) and fall back to index.html for SPA routes
const distCandidates = [
  path.join(process.cwd(), 'frontend', 'dist'),
  path.join(__dirname, '..', 'frontend', 'dist')
];
const distPath = distCandidates.find(fs.existsSync);

if (process.env.NODE_ENV === 'production' && distPath) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distPath, 'index.html'), err => next(err));
  });
}

// Ensure the database is connected before hitting any route
app.use(async (req, res, next) => {
  try {
    await ensureDBConnection();
    next();
  } catch (err) {
    if (req.path === '/api/health') return next();
    res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
});

// Routes
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

module.exports = app;
module.exports.utils = { ensureDBConnection, PORT };