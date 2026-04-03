const jwt = require('jsonwebtoken');
const config = require('../config');
const { users, blacklistedTokens } = require('../data/store');
const AppError = require('../utils/AppError');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please provide a valid token.', 401);
    }

    const token = authHeader.split(' ')[1];

    if (blacklistedTokens.has(token)) {
      throw new AppError('Token has been invalidated. Please log in again.', 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    const user = users.find((u) => u.id === decoded.id && u.deletedAt === null);

    if (!user) {
      throw new AppError('The user associated with this token no longer exists.', 401);
    }

    if (user.status === 'inactive') {
      throw new AppError('Your account has been deactivated. Contact an administrator.', 403);
    }

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
