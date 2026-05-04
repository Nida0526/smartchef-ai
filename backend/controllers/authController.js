const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// In-memory user store (works without MongoDB)
const users = new Map();

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    if (users.has(email)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const userId = 'user_' + Date.now();
    users.set(email, { _id: userId, name, email, password });

    console.log(`✅ New user registered: ${email}`);

    res.status(201).json({
        _id: userId,
        name,
        email,
        token: generateToken(userId),
    });
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check in-memory store
    const user = users.get(email);
    if (user && user.password === password) {
        console.log(`✅ User logged in: ${email}`);
        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    }

    res.status(401).json({ message: 'Invalid email or password' });
};

module.exports = { registerUser, loginUser };
