const app = require('./app');
const { ensureDBConnection, PORT } = app.utils;

(async () => {
  try {
    await ensureDBConnection();
    app.listen(PORT, () => {
      console.log(`SmartChef AI running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start SmartChef AI:', err.message);
    process.exit(1);
  }
})();