/**
 * In-Memory Data Store
 * ---------------------
 * This module acts as the single source of truth for all application data.
 * It replaces a real database with plain JavaScript objects / arrays.
 *
 * Seed data is pre-loaded so the API is usable immediately after starting.
 *
 * ASSUMPTION: Data is ephemeral — it resets every time the server restarts.
 */

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// ──────────────────────────── Users ────────────────────────────

const users = [
  {
    id: 'usr_001',
    name: 'Admin User',
    email: 'admin@finance.com',
    password: bcrypt.hashSync('Admin@123', 10),
    role: 'admin',
    status: 'active',
    createdAt: new Date('2025-01-01T08:00:00Z'),
    updatedAt: new Date('2025-01-01T08:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'usr_002',
    name: 'Jane Analyst',
    email: 'analyst@finance.com',
    password: bcrypt.hashSync('Analyst@123', 10),
    role: 'analyst',
    status: 'active',
    createdAt: new Date('2025-01-05T09:00:00Z'),
    updatedAt: new Date('2025-01-05T09:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'usr_003',
    name: 'Bob Viewer',
    email: 'viewer@finance.com',
    password: bcrypt.hashSync('Viewer@123', 10),
    role: 'viewer',
    status: 'active',
    createdAt: new Date('2025-02-10T10:00:00Z'),
    updatedAt: new Date('2025-02-10T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'usr_004',
    name: 'Inactive User',
    email: 'inactive@finance.com',
    password: bcrypt.hashSync('Inactive@123', 10),
    role: 'viewer',
    status: 'inactive',
    createdAt: new Date('2025-03-01T11:00:00Z'),
    updatedAt: new Date('2025-06-15T12:00:00Z'),
    deletedAt: null,
  },
];

// ──────────────────────────── Financial Records ────────────────

const records = [
  // ── January 2025 ──
  {
    id: 'rec_001',
    userId: 'usr_001',
    amount: 5000,
    type: 'income',
    category: 'salary',
    date: new Date('2025-01-05'),
    description: 'Monthly salary — January',
    createdAt: new Date('2025-01-05T09:00:00Z'),
    updatedAt: new Date('2025-01-05T09:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'rec_002',
    userId: 'usr_001',
    amount: 1200,
    type: 'expense',
    category: 'rent',
    date: new Date('2025-01-07'),
    description: 'Office rent — January',
    createdAt: new Date('2025-01-07T10:00:00Z'),
    updatedAt: new Date('2025-01-07T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'rec_003',
    userId: 'usr_001',
    amount: 250,
    type: 'expense',
    category: 'utilities',
    date: new Date('2025-01-10'),
    description: 'Electricity and internet bill',
    createdAt: new Date('2025-01-10T11:00:00Z'),
    updatedAt: new Date('2025-01-10T11:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'rec_004',
    userId: 'usr_002',
    amount: 800,
    type: 'income',
    category: 'freelance',
    date: new Date('2025-01-15'),
    description: 'Freelance consulting project',
    createdAt: new Date('2025-01-15T14:00:00Z'),
    updatedAt: new Date('2025-01-15T14:00:00Z'),
    deletedAt: null,
  },

  // ── February 2025 ──
  {
    id: 'rec_005',
    userId: 'usr_001',
    amount: 5000,
    type: 'income',
    category: 'salary',
    date: new Date('2025-02-05'),
    description: 'Monthly salary — February',
    createdAt: new Date('2025-02-05T09:00:00Z'),
    updatedAt: new Date('2025-02-05T09:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'rec_006',
    userId: 'usr_001',
    amount: 1200,
    type: 'expense',
    category: 'rent',
    date: new Date('2025-02-07'),
    description: 'Office rent — February',
    createdAt: new Date('2025-02-07T10:00:00Z'),
    updatedAt: new Date('2025-02-07T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'rec_007',
    userId: 'usr_002',
    amount: 350,
    type: 'expense',
    category: 'food',
    date: new Date('2025-02-12'),
    description: 'Team lunch and groceries',
    createdAt: new Date('2025-02-12T13:00:00Z'),
    updatedAt: new Date('2025-02-12T13:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'rec_008',
    userId: 'usr_001',
    amount: 2000,
    type: 'income',
    category: 'investment',
    date: new Date('2025-02-20'),
    description: 'Stock dividend payout',
    createdAt: new Date('2025-02-20T15:00:00Z'),
    updatedAt: new Date('2025-02-20T15:00:00Z'),
    deletedAt: null,
  },

  // ── March 2025 ──
  {
    id: 'rec_009',
    userId: 'usr_001',
    amount: 5000,
    type: 'income',
    category: 'salary',
    date: new Date('2025-03-05'),
    description: 'Monthly salary — March',
    createdAt: new Date('2025-03-05T09:00:00Z'),
    updatedAt: new Date('2025-03-05T09:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'rec_010',
    userId: 'usr_001',
    amount: 450,
    type: 'expense',
    category: 'transport',
    date: new Date('2025-03-08'),
    description: 'Monthly commute pass',
    createdAt: new Date('2025-03-08T08:00:00Z'),
    updatedAt: new Date('2025-03-08T08:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'rec_011',
    userId: 'usr_002',
    amount: 1500,
    type: 'income',
    category: 'freelance',
    date: new Date('2025-03-12'),
    description: 'Design project payment',
    createdAt: new Date('2025-03-12T16:00:00Z'),
    updatedAt: new Date('2025-03-12T16:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'rec_012',
    userId: 'usr_001',
    amount: 600,
    type: 'expense',
    category: 'entertainment',
    date: new Date('2025-03-15'),
    description: 'Annual streaming subscriptions',
    createdAt: new Date('2025-03-15T17:00:00Z'),
    updatedAt: new Date('2025-03-15T17:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'rec_013',
    userId: 'usr_001',
    amount: 1200,
    type: 'expense',
    category: 'rent',
    date: new Date('2025-03-07'),
    description: 'Office rent — March',
    createdAt: new Date('2025-03-07T10:00:00Z'),
    updatedAt: new Date('2025-03-07T10:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'rec_014',
    userId: 'usr_003',
    amount: 180,
    type: 'expense',
    category: 'healthcare',
    date: new Date('2025-03-20'),
    description: 'Annual health checkup',
    createdAt: new Date('2025-03-20T09:00:00Z'),
    updatedAt: new Date('2025-03-20T09:00:00Z'),
    deletedAt: null,
  },
  {
    id: 'rec_015',
    userId: 'usr_001',
    amount: 3000,
    type: 'income',
    category: 'investment',
    date: new Date('2025-03-25'),
    description: 'Mutual fund redemption',
    createdAt: new Date('2025-03-25T11:00:00Z'),
    updatedAt: new Date('2025-03-25T11:00:00Z'),
    deletedAt: null,
  },
];

// ──────────────────────────── Blacklisted Tokens ───────────────
const blacklistedTokens = new Set();

// ──────────────────────────── Exports ──────────────────────────

module.exports = { users, records, blacklistedTokens };
