/**
 * User Routes (Admin only)
 * -------------------------
 * GET    /api/users      — List all users (filtered, paginated)
 * GET    /api/users/:id  — Get user by ID
 * PATCH  /api/users/:id  — Update user (role, status, name)
 * DELETE /api/users/:id  — Soft-delete user
 */

const { Router } = require('express');
const userService = require('../services/userService');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { updateUserSchema, userQuerySchema } = require('../models/schemas');
const { success, paginated, noContent } = require('../utils/response');

const router = Router();

// All user management routes require admin role
router.use(authenticate, authorize('admin'));

// ─── List Users ───────────────────────────────────────
router.get(
  '/',
  validate(userQuerySchema, 'query'),
  (req, res) => {
    const { page, limit, ...filters } = req.query;
    const result = userService.listUsers({ page, limit, ...filters });
    paginated(res, result.users, page, limit, result.total);
  }
);

// ─── Get User by ID ──────────────────────────────────
router.get('/:id', (req, res, next) => {
  try {
    const user = userService.getUserById(req.params.id);
    success(res, { user });
  } catch (err) {
    next(err);
  }
});

// ─── Update User ─────────────────────────────────────
router.patch(
  '/:id',
  validate(updateUserSchema),
  (req, res, next) => {
    try {
      const user = userService.updateUser(req.params.id, req.body);
      success(res, { user });
    } catch (err) {
      next(err);
    }
  }
);

// ─── Delete User (soft) ─────────────────────────────
router.delete('/:id', (req, res, next) => {
  try {
    userService.deleteUser(req.params.id, req.user.id);
    noContent(res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
