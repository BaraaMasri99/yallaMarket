import { db, initializeDatabase } from '../config/database.js';
import { upsertCatalogData } from './catalogSeed.js';

initializeDatabase();

const counts = upsertCatalogData();

console.log('Catalog seeded successfully.');
console.log(`Categories: ${counts.categories}`);
console.log(`Products: ${counts.products}`);

db.close();
