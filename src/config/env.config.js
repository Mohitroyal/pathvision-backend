// backend/src/config/env.config.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key',
  groqApiKey: process.env.GROQ_API_KEY,
  corsOrigin: [
    'https://pathvision-ias7.vercel.app',
    'https://pathvision-frontend-6jv4.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:8080'
  ],
};
