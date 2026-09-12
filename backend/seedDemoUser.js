const bcrypt = require('bcryptjs');
const User = require('./models/User');

const DEMO_ACCOUNTS = [
  { name: 'Demo Chef', email: 'demo@smartchef.ai', password: 'smartchef123' },
  { name: 'Guest User', email: 'guest@smartchef.ai', password: 'guest1234' }
];

async function seedDemoUsers() {
  for (const acc of DEMO_ACCOUNTS) {
    const existing = await User.findOne({ email: acc.email });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(acc.password, salt);
      await User.create({ name: acc.name, email: acc.email, passwordHash });
      console.log(`Seeded demo user: ${acc.email}`);
    }
  }
}

module.exports = { seedDemoUsers, DEMO_ACCOUNTS };