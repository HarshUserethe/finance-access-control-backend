const config = require('../config');

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let status = err.status || 'error';

  if (err.name === 'SyntaxError' && err.status === 400) {
    statusCode = 400;
    message = 'Invalid JSON payload';
    status = 'fail';
  }

  if (config.nodeEnv === 'development' && statusCode === 500) {
    console.error('🔴 Unexpected Error:', err);
  }

  res.status(statusCode).json({
    status,
    message,
    ...(config.nodeEnv === 'development' && statusCode === 500 ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;
