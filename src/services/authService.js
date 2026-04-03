const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { users, blacklistedTokens } = require('../data/store');
const AppError = require('../utils/AppError');

exports.register = async ({ name, email, password, role }) => {
  const existing = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.deletedAt === null
  );
  if (existing) {
    throw new AppError('A user with this email already exists.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = {
    id: `usr_${uuidv4().slice(0, 8)}`,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: role || config.roles.VIEWER,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  users.push(newUser);

  const token = generateToken(newUser);
  const { password: _, ...safeUser } = newUser;

  return { user: safeUser, token };
};

exports.login = async ({ email, password }) => {
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.deletedAt === null
  );

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (user.status === 'inactive') {
    throw new AppError('Your account has been deactivated. Contact an administrator.', 403);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = generateToken(user);
  const { password: _, ...safeUser } = user;

  return { user: safeUser, token };
};

exports.logout = (token) => {
  blacklistedTokens.add(token);
};

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}
