/**
 * User Service
 * -------------
 * Business logic for user CRUD and admin-level user management.
 */

const { users } = require('../data/store');
const AppError = require('../utils/AppError');

/**
 * List users with optional filters, search, and pagination.
 */
exports.listUsers = ({ page = 1, limit = 10, role, status, search }) => {
  let filtered = users.filter((u) => u.deletedAt === null);

  if (role) filtered = filtered.filter((u) => u.role === role);
  if (status) filtered = filtered.filter((u) => u.status === status);

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  // Strip passwords
  const safe = paginated.map(({ password, ...rest }) => rest);

  return { users: safe, total };
};

/**
 * Get a single user by ID.
 */
exports.getUserById = (id) => {
  const user = users.find((u) => u.id === id && u.deletedAt === null);
  if (!user) throw new AppError('User not found.', 404);

  const { password, ...safeUser } = user;
  return safeUser;
};

/**
 * Update a user's name, role, or status.
 */
exports.updateUser = (id, updates) => {
  const user = users.find((u) => u.id === id && u.deletedAt === null);
  if (!user) throw new AppError('User not found.', 404);

  if (updates.name !== undefined) user.name = updates.name;
  if (updates.role !== undefined) user.role = updates.role;
  if (updates.status !== undefined) user.status = updates.status;
  user.updatedAt = new Date();

  const { password, ...safeUser } = user;
  return safeUser;
};

/**
 * Soft-delete a user.
 */
exports.deleteUser = (id, requesterId) => {
  if (id === requesterId) {
    throw new AppError('You cannot delete your own account.', 400);
  }

  const user = users.find((u) => u.id === id && u.deletedAt === null);
  if (!user) throw new AppError('User not found.', 404);

  user.deletedAt = new Date();
  user.status = 'inactive';
  user.updatedAt = new Date();
};
