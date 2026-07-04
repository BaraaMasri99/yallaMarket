import app from './app.js';
import { db, initializeDatabase } from './config/database.js';
import { env } from './config/env.js';
import { seedCatalogIfEmpty } from './seeders/catalogSeed.js';

initializeDatabase();

const seedResult = seedCatalogIfEmpty();
if (seedResult.seeded) {
  console.log(
    `Catalog seeded on startup (categories: ${seedResult.before.categories} -> ${seedResult.after.categories}, products: ${seedResult.before.products} -> ${seedResult.after.products})`
  );
} else {
  console.log(
    `Catalog seed skipped (${seedResult.reason}; categories: ${seedResult.after.categories}, products: ${seedResult.after.products})`
  );
}

const PORT = env.port;

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
