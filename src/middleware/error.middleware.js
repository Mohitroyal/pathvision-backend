// backend/src/middleware/error.middleware.js
const config = require('../config/env.config');

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message,
    stack: config.nodeEnv === 'production' ? '🥞' : err.stack,
  });
};

module.exports = errorHandler;
