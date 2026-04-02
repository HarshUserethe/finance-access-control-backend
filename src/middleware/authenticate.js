/**
 * Authentication Middleware
 * -------------------------
 * Verifies the JWT token from the Authorization header, attaches the
 * authenticated user object to `req.user`, and rejects requests with
 * invalid / missing / blacklisted tokens.
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const { users, blacklistedTokens } = require('../data/store');
const AppError = require('../utils/AppError');

const authenticate = (req, res, next) => {
  try {
    // 1. Extract token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please provide a valid token.', 401);
    }

    const token = authHeader.split(' ')[1];

    // 2. Check blacklist (logged-out tokens)
    if (blacklistedTokens.has(token)) {
      throw new AppError('Token has been invalidated. Please log in again.', 401);
    }

    // 3. Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // 4. Find user and confirm they still exist & are active
    const user = users.find(
      (u) => u.id === decoded.id && u.deletedAt === null
    );

    if (!user) {
      throw new AppError('The user associated with this token no longer exists.', 401);
    }

    if (user.status === 'inactive') {
      throw new AppError('Your account has been deactivated. Contact an administrator.', 403);
    }

    // 5. Attach user (excluding password) and raw token to request
    const { password, ...safeUser } = user;
    req.user = safeUser;
    req.token = token;

    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please log in again.', 401));
    }
    next(err);
  }
};

module.exports = authenticate;
