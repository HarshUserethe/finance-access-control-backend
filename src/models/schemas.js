/**
 * Joi validation schemas for request payloads.
 */

const Joi = require('joi');
const config = require('../config');

// ──────────────────── Auth Schemas ────────────────────

exports.registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required()
    .messages({ 'string.empty': 'Name is required' }),

  email: Joi.string().trim().email().required()
    .messages({ 'string.email': 'A valid email is required' }),

  password: Joi.string().min(6).max(128).required()
    .messages({ 'string.min': 'Password must be at least 6 characters' }),

  role: Joi.string()
    .valid(...Object.values(config.roles))
    .default(config.roles.VIEWER),
});

exports.loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

// ──────────────────── User Schemas ────────────────────

exports.updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  role: Joi.string().valid(...Object.values(config.roles)),
  status: Joi.string().valid('active', 'inactive'),
}).min(1).messages({ 'object.min': 'At least one field must be provided to update' });

// ──────────────────── Record Schemas ──────────────────

exports.createRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required()
    .messages({ 'number.positive': 'Amount must be a positive number' }),

  type: Joi.string().valid(...config.recordTypes).required()
    .messages({ 'any.only': `Type must be one of: ${config.recordTypes.join(', ')}` }),

  category: Joi.string().valid(...config.categories).required()
    .messages({ 'any.only': `Category must be one of: ${config.categories.join(', ')}` }),

  date: Joi.date().iso().max('now').required()
    .messages({ 'date.max': 'Date cannot be in the future' }),

  description: Joi.string().trim().max(500).allow('').default(''),
});

exports.updateRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2),
  type: Joi.string().valid(...config.recordTypes),
  category: Joi.string().valid(...config.categories),
  date: Joi.date().iso().max('now'),
  description: Joi.string().trim().max(500).allow(''),
}).min(1).messages({ 'object.min': 'At least one field must be provided to update' });

// ──────────────────── Query Schemas ───────────────────

exports.recordQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(config.pagination.defaultPage),
  limit: Joi.number().integer().min(1).max(config.pagination.maxLimit).default(config.pagination.defaultLimit),
  type: Joi.string().valid(...config.recordTypes),
  category: Joi.string().valid(...config.categories),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  search: Joi.string().trim().max(100),
  sortBy: Joi.string().valid('date', 'amount', 'createdAt').default('date'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

exports.userQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(config.pagination.defaultPage),
  limit: Joi.number().integer().min(1).max(config.pagination.maxLimit).default(config.pagination.defaultLimit),
  role: Joi.string().valid(...Object.values(config.roles)),
  status: Joi.string().valid('active', 'inactive'),
  search: Joi.string().trim().max(100),
});
