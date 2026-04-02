/**
 * Dashboard Routes
 * -----------------
 * GET /api/dashboard/summary           — Overall totals     (All authenticated)
 * GET /api/dashboard/category-summary  — Per-category data   (All authenticated)
 * GET /api/dashboard/trends            — Monthly trends      (Analyst + Admin)
 * GET /api/dashboard/trends/weekly     — Weekly trends       (Analyst + Admin)
 * GET /api/dashboard/recent-activity   — Latest N records    (All authenticated)
 */

const { Router } = require('express');
const dashboardService = require('../services/dashboardService');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { success } = require('../utils/response');

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// ─── Summary ────────────────────────────────────────
router.get('/summary', (req, res) => {
  const data = dashboardService.getSummary();
  success(res, data);
});

// ─── Category Summary ───────────────────────────────
router.get('/category-summary', (req, res) => {
  const data = dashboardService.getCategorySummary();
  success(res, data);
});

// ─── Monthly Trends (Analyst + Admin) ───────────────
router.get(
  '/trends',
  authorize('analyst', 'admin'),
  (req, res) => {
    const data = dashboardService.getMonthlyTrends();
    success(res, data);
  }
);

// ─── Weekly Trends (Analyst + Admin) ────────────────
router.get(
  '/trends/weekly',
  authorize('analyst', 'admin'),
  (req, res) => {
    const data = dashboardService.getWeeklyTrends();
    success(res, data);
  }
);

// ─── Recent Activity ────────────────────────────────
router.get('/recent-activity', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const data = dashboardService.getRecentActivity(limit);
  success(res, data);
});

module.exports = router;
