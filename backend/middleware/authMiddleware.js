const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    const token = req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists, please log in again' });
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
};