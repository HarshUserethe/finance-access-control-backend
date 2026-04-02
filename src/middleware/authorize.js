/**
 * Role-Based Access Control (RBAC) Middleware
 * --------------------------------------------
 * Returns an Express middleware that restricts access to users whose role
 * is included in the supplied `allowedRoles` list.
 *
 * Usage:
 *   router.post('/records', authenticate, authorize('admin'), handler);
 *   router.get('/trends',   authenticate, authorize('analyst', 'admin'), handler);
 */

const AppError = require('../utils/AppError');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('Authentication is required before authorization.', 401)
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = authorize;
