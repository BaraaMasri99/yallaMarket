import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  databasePath: process.env.DATABASE_PATH || './data/yalla-market.sqlite',
};
