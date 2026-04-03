const { Router } = require('express');
const dashboardService = require('../services/dashboardService');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { success } = require('../utils/response');

const router = Router();

router.use(authenticate);

router.get('/summary', (req, res) => {
  const data = dashboardService.getSummary();
  success(res, data);
});

router.get('/category-summary', (req, res) => {
  const data = dashboardService.getCategorySummary();
  success(res, data);
});

router.get('/trends', authorize('analyst', 'admin'), (req, res) => {
  const data = dashboardService.getMonthlyTrends();
  success(res, data);
});

router.get('/trends/weekly', authorize('analyst', 'admin'), (req, res) => {
  const data = dashboardService.getWeeklyTrends();
  success(res, data);
});

router.get('/recent-activity', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const data = dashboardService.getRecentActivity(limit);
  success(res, data);
});

module.exports = router;
