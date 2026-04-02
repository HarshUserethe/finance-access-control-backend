/**
 * Record Routes
 * ---------------
 * POST   /api/records      — Create record        (Admin only)
 * GET    /api/records      — List / filter records (All authenticated)
 * GET    /api/records/:id  — Get single record     (All authenticated)
 * PUT    /api/records/:id  — Update record         (Admin only)
 * DELETE /api/records/:id  — Soft-delete record    (Admin only)
 */

const { Router } = require('express');
const recordService = require('../services/recordService');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createRecordSchema,
  updateRecordSchema,
  recordQuerySchema,
} = require('../models/schemas');
const { success, created, paginated, noContent } = require('../utils/response');

const router = Router();

// All record routes require authentication
router.use(authenticate);

// ─── Create Record (Admin) ──────────────────────────
router.post(
  '/',
  authorize('admin'),
  validate(createRecordSchema),
  (req, res) => {
    const record = recordService.createRecord(req.body, req.user.id);
    created(res, { record });
  }
);

// ─── List / Filter Records ─────────────────────────
router.get(
  '/',
  validate(recordQuerySchema, 'query'),
  (req, res) => {
    const { page, limit, ...filters } = req.query;
    const result = recordService.listRecords({ page, limit, ...filters });
    paginated(res, result.records, page, limit, result.total);
  }
);

// ─── Get Record by ID ──────────────────────────────
router.get('/:id', (req, res, next) => {
  try {
    const record = recordService.getRecordById(req.params.id);
    success(res, { record });
  } catch (err) {
    next(err);
  }
});

// ─── Update Record (Admin) ─────────────────────────
router.put(
  '/:id',
  authorize('admin'),
  validate(updateRecordSchema),
  (req, res, next) => {
    try {
      const record = recordService.updateRecord(req.params.id, req.body);
      success(res, { record });
    } catch (err) {
      next(err);
    }
  }
);

// ─── Delete Record (Admin, soft) ───────────────────
router.delete(
  '/:id',
  authorize('admin'),
  (req, res, next) => {
    try {
      recordService.deleteRecord(req.params.id);
      noContent(res);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
