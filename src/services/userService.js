const { users } = require('../data/store');
const AppError = require('../utils/AppError');

exports.listUsers = ({ page = 1, limit = 10, role, status, search }) => {
  let filtered = users.filter((u) => u.deletedAt === null);

  if (role) filtered = filtered.filter((u) => u.role === role);
  if (status) filtered = filtered.filter((u) => u.status === status);

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  const safe = paginated.map(({ password, ...rest }) => rest);

  return { users: safe, total };
};

exports.getUserById = (id) => {
  const user = users.find((u) => u.id === id && u.deletedAt === null);
  if (!user) throw new AppError('User not found.', 404);

  const { password, ...safeUser } = user;
  return safeUser;
};

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
