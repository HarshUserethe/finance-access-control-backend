const { Router } = require('express');
const recordService = require('../services/recordService');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createRecordSchema, updateRecordSchema, recordQuerySchema } = require('../models/schemas');
const { success, created, paginated, noContent } = require('../utils/response');

const router = Router();

router.use(authenticate);

router.post('/', authorize('admin'), validate(createRecordSchema), (req, res) => {
  const record = recordService.createRecord(req.body, req.user.id);
  created(res, { record });
});

router.get('/', validate(recordQuerySchema, 'query'), (req, res) => {
  const { page, limit, ...filters } = req.query;
  const result = recordService.listRecords({ page, limit, ...filters });
  paginated(res, result.records, page, limit, result.total);
});

router.get('/:id', (req, res, next) => {
  try {
    const record = recordService.getRecordById(req.params.id);
    success(res, { record });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authorize('admin'), validate(updateRecordSchema), (req, res, next) => {
  try {
    const record = recordService.updateRecord(req.params.id, req.body);
    success(res, { record });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authorize('admin'), (req, res, next) => {
  try {
    recordService.deleteRecord(req.params.id);
    noContent(res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
