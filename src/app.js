/**
 * Express Application Entry Point
 * ---------------------------------
 * Sets up middleware, routes, and global error handling.
 * Starts the server on the configured port.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

// ─── Route imports ────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const recordRoutes = require('./routes/recordRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// ─── Global Middleware ────────────────────────────────
app.use(helmet());                       // Security headers
app.use(cors());                         // Cross-origin support
app.use(express.json({ limit: '10kb' }));// Body parser with size limit
app.use(express.urlencoded({ extended: true }));

// HTTP request logging (skip in test mode)
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Finance API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ─── API Routes ───────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── 404 Handler ──────────────────────────────────────
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404));
});

// ─── Global Error Handler ─────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────
if (config.nodeEnv !== 'test') {
  app.listen(config.port, () => {
    console.log(`\n🚀  Finance API running on http://localhost:${config.port}`);
    console.log(`📖  Health check:  http://localhost:${config.port}/api/health`);
    console.log(`🔑  Environment:   ${config.nodeEnv}\n`);
    console.log('── Seed Credentials ──────────────────────');
    console.log('  Admin:   admin@finance.com   / Admin@123');
    console.log('  Analyst: analyst@finance.com / Analyst@123');
    console.log('  Viewer:  viewer@finance.com  / Viewer@123');
    console.log('──────────────────────────────────────────\n');
  });
}

module.exports = app;
