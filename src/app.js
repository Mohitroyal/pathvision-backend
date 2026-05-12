const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env.config');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Production Security & Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
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
