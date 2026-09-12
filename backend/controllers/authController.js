const User = require('../models/User');
const Preference = require('../models/Preference');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ name, email, passwordHash });
    await user.save();

    // Create default preference
    const pref = new Preference({ userId: user._id });
    await pref.save();

    const payload = { user: { id: user.id } };
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    jwt.sign(payload, secret, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user._id, name, email } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    jwt.sign(payload, secret, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user._id, name: user.name, email } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
