/**
 * Auth Routes
 * ------------
 * POST /api/auth/register  — Register a new user
 * POST /api/auth/login     — Login and receive JWT
 * POST /api/auth/logout    — Invalidate current token
 * GET  /api/auth/me        — Get authenticated user's profile
 */

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authService = require('../services/authService');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../models/schemas');
const { success, created } = require('../utils/response');

const router = Router();

// Rate-limit auth endpoints (15 requests per 15 min per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// ─── Register ─────────────────────────────────────────
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      created(res, result);
    } catch (err) {
      next(err);
    }
  }
);

// ─── Login ────────────────────────────────────────────
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      success(res, result);
    } catch (err) {
      next(err);
    }
  }
);

// ─── Logout ───────────────────────────────────────────
router.post('/logout', authenticate, (req, res) => {
  authService.logout(req.token);
  success(res, { message: 'Logged out successfully.' });
});

// ─── Me (current user profile) ────────────────────────
router.get('/me', authenticate, (req, res) => {
  success(res, { user: req.user });
});

module.exports = router;
