import app from './app.js';
import { db, initializeDatabase } from './config/database.js';
import { env } from './config/env.js';

initializeDatabase();

const PORT = process.env.PORT || env.port || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
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
