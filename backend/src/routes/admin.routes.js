const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');
const { getDashboardOverview, refreshDashboard } = require('../controllers/admin.controller');

router.get('/dashboard/overview', authMiddleware, requireAdmin, getDashboardOverview);
router.post('/dashboard/refresh', authMiddleware, requireAdmin, refreshDashboard);

module.exports = router;
