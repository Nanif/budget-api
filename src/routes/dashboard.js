/**
 * Dashboard API routes
 */

import express from 'express';
import { DashboardService } from '../services/dashboardService.js';
import { getUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(getUserId);

// GET /summary - Get dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const { budgetYearId } = req.query;
    const summary = await DashboardService.getDashboardSummary(req.userId, budgetYearId);
    res.json({
      success: true,
      data: summary,
      message: 'Dashboard summary retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /dashboard/summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard summary',
      message: error.message
    });
  }
});

export default router;