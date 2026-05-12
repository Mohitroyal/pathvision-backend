const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env.config');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const allowed = config.corsOrigin;
    // Also allow any *.vercel.app and localhost dynamically
    const isVercel = origin.endsWith('.vercel.app');
    const isLocalhost = origin.startsWith('http://localhost');

    if (allowed.includes(origin) || isVercel || isLocalhost) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Base Route
app.use('/api', routes);

// Base Health Check
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    system: 'PathVision OS', 
    version: '2.0.0-cloud',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handling
app.use(errorHandler);

module.exports = app;
