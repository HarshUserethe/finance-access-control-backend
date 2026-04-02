const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'default_secret_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Role hierarchy (higher number = more privileges)
  roles: {
    VIEWER: 'viewer',
    ANALYST: 'analyst',
    ADMIN: 'admin',
  },

  // Role privilege levels for comparison
  roleHierarchy: {
    viewer: 1,
    analyst: 2,
    admin: 3,
  },

  // Pagination defaults
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
  },

  // Record categories
  categories: [
    'salary',
    'freelance',
    'investment',
    'food',
    'rent',
    'utilities',
    'transport',
    'entertainment',
    'healthcare',
    'education',
    'shopping',
    'travel',
    'other',
  ],

  // Record types
  recordTypes: ['income', 'expense'],
};
