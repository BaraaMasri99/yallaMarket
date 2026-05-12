import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required. Create server/.env from server/.env.example.');
}

const productionClientOrigin = 'https://yalla-market-62jk.vercel.app';

function parseOrigins(value) {
  return value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const clientOrigins = parseOrigins(process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN);

export const env = {
  port: process.env.PORT || 5000,
  clientOrigins: clientOrigins?.length
    ? clientOrigins
    : ['http://localhost:5173', 'http://127.0.0.1:5173', productionClientOrigin],
  databasePath: process.env.DATABASE_PATH || './data/yalla-market.sqlite',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
