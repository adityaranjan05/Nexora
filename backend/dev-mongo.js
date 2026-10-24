/**
 * dev-mongo.js
 * Starts a local MongoDB instance on port 27017 using mongodb-memory-server.
 * No installation or sudo password required.
 * Run: node dev-mongo.js
 * Keep this terminal open while working.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

const PORT = 27017;

console.log('[dev-mongo] Starting local MongoDB on port', PORT, '...');

const server = await MongoMemoryServer.create({
  instance: {
    port: PORT,
    dbName: 'aicte_complaints',
  },
});

const uri = server.getUri();
console.log('[dev-mongo] ✅ MongoDB ready!');
console.log('[dev-mongo]    URI:', uri);
console.log('[dev-mongo] Keep this terminal open. Press Ctrl+C to stop.\n');

// Keep the process alive
process.on('SIGINT', async () => {
  console.log('\n[dev-mongo] Shutting down MongoDB...');
  await server.stop();
  process.exit(0);
});
