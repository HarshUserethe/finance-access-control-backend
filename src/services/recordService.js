/**
 * Record Service
 * ---------------
 * Business logic for financial record CRUD, filtering, and pagination.
 */

const { v4: uuidv4 } = require('uuid');
const { records } = require('../data/store');
const AppError = require('../utils/AppError');

/**
 * Create a new financial record.
 */
exports.createRecord = (data, userId) => {
  const newRecord = {
    id: `rec_${uuidv4().slice(0, 8)}`,
    userId,
    amount: data.amount,
    type: data.type,
    category: data.category,
    date: new Date(data.date),
    description: data.description || '',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  records.push(newRecord);
  return newRecord;
};

/**
 * List records with filters, search, sort, and pagination.
 */
exports.listRecords = ({
  page = 1,
  limit = 10,
  type,
  category,
  startDate,
  endDate,
  search,
  sortBy = 'date',
  order = 'desc',
}) => {
  let filtered = records.filter((r) => r.deletedAt === null);

  // ── Filters ──
  if (type) filtered = filtered.filter((r) => r.type === type);
  if (category) filtered = filtered.filter((r) => r.category === category);

  if (startDate) {
    const start = new Date(startDate);
    filtered = filtered.filter((r) => new Date(r.date) >= start);
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter((r) => new Date(r.date) <= end);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }

  // ── Sort ──
  filtered.sort((a, b) => {
    let valA, valB;
    if (sortBy === 'amount') {
      valA = a.amount;
      valB = b.amount;
    } else if (sortBy === 'createdAt') {
      valA = new Date(a.createdAt);
      valB = new Date(b.createdAt);
    } else {
      valA = new Date(a.date);
      valB = new Date(b.date);
    }
    return order === 'asc' ? valA - valB : valB - valA;
  });

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return { records: paginated, total };
};

/**
 * Get a single record by ID.
 */
exports.getRecordById = (id) => {
  const record = records.find((r) => r.id === id && r.deletedAt === null);
  if (!record) throw new AppError('Record not found.', 404);
  return record;
};

/**
 * Update an existing record.
 */
exports.updateRecord = (id, updates) => {
  const record = records.find((r) => r.id === id && r.deletedAt === null);
  if (!record) throw new AppError('Record not found.', 404);

  if (updates.amount !== undefined) record.amount = updates.amount;
  if (updates.type !== undefined) record.type = updates.type;
  if (updates.category !== undefined) record.category = updates.category;
  if (updates.date !== undefined) record.date = new Date(updates.date);
  if (updates.description !== undefined) record.description = updates.description;
  record.updatedAt = new Date();

  return record;
};

/**
 * Soft-delete a record.
 */
exports.deleteRecord = (id) => {
  const record = records.find((r) => r.id === id && r.deletedAt === null);
  if (!record) throw new AppError('Record not found.', 404);

  record.deletedAt = new Date();
  record.updatedAt = new Date();
};
