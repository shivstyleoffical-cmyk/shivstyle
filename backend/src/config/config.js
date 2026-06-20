import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve current file directory (since you're using ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current environment (defaults to development)
const env = process.env.NODE_ENV || 'development';

// Load .env file only in development or if it exists
const envFilePath = path.resolve(__dirname, `../../.env.${env}`);
dotenv.config({ path: envFilePath });
// Also load standard .env if it exists (Render/Common)
dotenv.config();

// Helper to get env var with fallback
const getEnv = (key, fallback) => process.env[key] || fallback;

// Now build the config object
const config = {
  env,
  port: getEnv('PORT', 6006),
  db: {
    url: getEnv('DATABASE_URL', ''), // Prefer connection string (Standard for Render)
    host: getEnv('DB_HOST', ''),
    port: parseInt(getEnv('DB_PORT', '5432'), 10),
    username: getEnv('DB_USER', ''),
    password: getEnv('DB_PASSWORD', ''),
    database: getEnv('DB_NAME', 'ecommerce_w6oi'),
    ssl: getEnv('DB_SSL', 'false') === 'true',
  },
  apiUrl: getEnv('API_URL', 'http://localhost:6006'),
  jwt: {
    secret: getEnv('JWT_SECRET', 'your_jwt_production_secret_key'),
    expiration: getEnv('JWT_EXPIRATION', '1h'),
  },
  cloudinary: {
    name: getEnv('CLOUDINARY_CLOUD_NAME', 'divo9znid'),
    apiKey: getEnv('CLOUDINARY_API_KEY', '776845718457936'),
    apiSecret: getEnv('CLOUDINARY_API_SECRET', 'EThXuPa880LODtgw9rHVRUwJ3mA'),
  }
};

export default config;
