/**
 * Global Error Handling Middleware
 * ---------------------------------
 * Catches all errors forwarded via next(err) and returns a consistent
 * JSON error response. Distinguishes operational errors (AppError) from
 * unexpected programming errors.
 */

const config = require('../config');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let status = err.status || 'error';

  // Specific error type handling
  if (err.name === 'SyntaxError' && err.status === 400) {
    statusCode = 400;
    message = 'Invalid JSON payload';
    status = 'fail';
  }

  // Log unexpected errors in development
  if (config.nodeEnv === 'development' && statusCode === 500) {
    console.error('🔴 Unexpected Error:', err);
  }

  res.status(statusCode).json({
    status,
    message,
    ...(config.nodeEnv === 'development' && statusCode === 500
      ? { stack: err.stack }
      : {}),
  });
};

module.exports = errorHandler;
