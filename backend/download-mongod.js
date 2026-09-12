// Pre-downloads the MongoDB binary used by MongoMemoryServer and copies it into
// the frontend build output (frontend/dist/.cache) so a single includeFiles glob
// ("frontend/dist/**") ships it inside the serverless function bundle.
// Run during the Vercel build (buildCommand). See vercel.json.
const fs = require('fs');
const path = require('path');
const { MongoMemoryServer, MongoBinary } = require('mongodb-memory-server');

process.env.MONGOMS_DOWNLOAD_DIR = path.join(__dirname, '.cache');
process.env.MONGOMS_CACHE_DIR = path.join(__dirname, '.cache');

(async () => {
  console.log('Downloading MongoDB binary for serverless runtime...');
  const server = await MongoMemoryServer.create({
    binary: { downloadDir: path.join(__dirname, '.cache') }
  });
  console.log(`MongoDB binary ready (${server.getUri()})`);

  const binPath = await MongoBinary.getPath();
  if (!fs.existsSync(binPath)) throw new Error(`Binary missing at ${binPath}`);

  const target = path.join(__dirname, '..', 'frontend', 'dist', '.cache');
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(path.dirname(binPath), target, { recursive: true });
  console.log(`MongoDB binary cache copied -> ${target}`);

  await server.stop();
  process.exit(0);
})().catch((err) => {
  console.error('Failed to download MongoDB binary:', err.message);
  process.exit(1);
});