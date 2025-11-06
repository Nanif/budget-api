/**
 * Cash Envelope Transactions API routes
 */

import express from 'express';
import { getUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { BudgetYearService } from '../services/budgetYearService.js';
import { CashEnvelopeTransactionService } from '../services/cashEnvelopeTransactionService.js';

const router = express.Router();
router.use(getUserId);

// GET / - List transactions by month within selected/active/current budget year
router.get('/', async (req, res) => {
  try {
    const rawMonth = req.query.month;
    const month = rawMonth ? parseInt(rawMonth, 10) : (new Date().getMonth() + 1);
    if (!Number.isFinite(month) || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid month. Must be 1-12.'
      });
    }

    // Prefer explicit budgetYearId if provided in query
    let budgetYearId = req.query.budgetYearId || null;
    
    // Otherwise use active budget year, then fallback to today's date
    if (!budgetYearId) {
      let active = null;
      try {
        active = await BudgetYearService.getActiveBudgetYear(req.userId);
      } catch (_) {
        // ignore; will try by date
      }
      budgetYearId = active?.id || null;
    }
   

    if (!budgetYearId) {
      return res.status(400).json({
        success: false,
        error: 'No active/current budget year found.'
      });
    }

    const data = await CashEnvelopeTransactionService.getTransactionsByMonth(
      req.userId,
      budgetYearId,
      month
    );

    res.json({
      success: true,
      data,
      message: 'Cash envelope transactions retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /cash-envelope-transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve transactions',
      message: error.message
    });
  }
});

// POST / - Create a new cash envelope transaction
router.post('/', async (req, res) => {
  try {
    const { fund_id, date, amount, description, budget_year_id: bodyBudgetYearId } = req.body;

    if (!fund_id || !date || amount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'fund_id, date, and amount are required.'
      });
    }

    // Determine budget year: prefer explicit, then active, then infer from date
    let budget_year_id = bodyBudgetYearId || null;
    if (!budget_year_id) {
      let active = null;
      try {
        active = await BudgetYearService.getActiveBudgetYear(req.userId);
      } catch (_) {}
      budget_year_id = active?.id || null;
    }
  
    if (!budget_year_id) {
      return res.status(400).json({
        success: false,
        error: 'No budget year found (provide budget_year_id or a date within a budget year).'
      });
    }

    const txData = {
      fund_id,
      budget_year_id,
      date,
      description: description ?? null,
      amount
    };

    const created = await CashEnvelopeTransactionService.createTransaction(txData, req.userId);
    res.status(201).json({
      success: true,
      data: created,
      message: 'Cash envelope transaction created successfully'
    });
  } catch (error) {
    logger.error('Error in POST /cash-envelope-transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transaction',
      message: error.message
    });
  }
});

export default router;
