const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedDemoUsers } = require('./seedDemoUser');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SmartChef AI', time: new Date().toISOString() });
});

// In production, serve the built frontend and fall back to index.html for SPA routes
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distPath, 'index.html'), err => next(err));
  });
}

const PORT = process.env.PORT || 5000;

async function connectDB() {
  let uri = process.env.MONGODB_URI;
  if (!uri || uri === 'mock_local') {
    console.log('No MongoDB URI found, starting in-memory database...');
    const mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
  }

  try {
    await mongoose.connect(uri);
    console.log(`Connected to MongoDB: ${uri}`);
    await seedDemoUsers();
    app.listen(PORT, () => {
      console.log(`SmartChef AI running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

connectDB();