import app from './app.js';
import { db, initializeDatabase } from './config/database.js';
import { env } from './config/env.js';

initializeDatabase();

const server = app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    console.log('SQLite connection closed');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
