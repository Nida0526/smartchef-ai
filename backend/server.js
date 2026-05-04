const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const recipeRoutes = require('./routes/recipeRoutes');
const authRoutes = require('./routes/authRoutes');
dotenv.config();

const app = express();

// CORS
app.use(cors());
app.use(express.json());

// Connect to MongoDB middleware
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({ message: 'Database connection failed', error: error.message });
    }
});

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('SmartChef AI API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Export for Vercel
module.exports = app;

// Only listen if not running as a serverless function
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`✅ SmartChef Backend running on http://localhost:${PORT}`);
    });
}
