/**
 * Incomes API routes
 */

import express from 'express';
import { IncomeService } from '../services/incomeService.js';
import { BudgetYearService } from '../services/budgetYearService.js';
import { getUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(getUserId);

// GET / - Get all incomes with filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      budgetYearId: req.query.budgetYearId,
      month: req.query.month,
      year: req.query.year,
      source: req.query.source,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };

    const incomes = await IncomeService.getAllIncomes(req.userId, filters);
    res.json({
      success: true,
      data: incomes,
      message: 'Incomes retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /incomes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve incomes',
      message: error.message
    });
  }
});

// GET /stats/summary - Get income statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { budgetYearId } = req.query;
    const summary = await IncomeService.getIncomeSummary(req.userId, budgetYearId);
    res.json({
      success: true,
      data: summary,
      message: 'Income summary retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /incomes/stats/summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve income summary',
      message: error.message
    });
  }
});

// GET /:id - Get specific income
router.get('/:id', async (req, res) => {
  try {
    const income = await IncomeService.getIncomeById(req.params.id, req.userId);
    res.json({
      success: true,
      data: income,
      message: 'Income retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /incomes/:id:', error);
    res.status(404).json({
      success: false,
      error: 'Income not found',
      message: error.message
    });
  }
});


// POST / - Create new income
router.post('/', async (req, res) => {
  try {
    
    const { name, amount, source, date, note } = req.body;
    
    //todo calculate the budget_year_id from the date add the getBudgetYearIdByDate in budgetService
    const budget_year_id = await BudgetYearService.getBudgetYearIdByDate(date);
    if (!budget_year_id) {
      return res.status(400).json({
        success: false,
        error: 'לא קיימת שנת תקציב עבור תאריך ההכנסה'
      });
    }

    if (!name || !amount || !budget_year_id || !date) {
      return res.status(400).json({
        success: false,
        error: 'Name, amount, budget_year_id, and date are required'
      });
    }

    const incomeData = {
      name,
      amount,
      budget_year_id,
      source,
      date,
      note
    };

    const income = await IncomeService.createIncome(incomeData, req.userId);
    res.status(201).json({
      success: true,
      data: income,
      message: 'Income created successfully'
    });
  } catch (error) {
    logger.error('Error in POST /incomes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create income',
      message: error.message
    });
  }
});

// PUT /:id - Update income
router.put('/:id', async (req, res) => {
  try {
    const { name, amount, budget_year_id, source, date, note } = req.body;
    
    const incomeData = {};
    if (name !== undefined) incomeData.name = name;
    if (amount !== undefined) incomeData.amount = amount;
    if (budget_year_id !== undefined) incomeData.budget_year_id = budget_year_id;
    if (source !== undefined) incomeData.source = source;
    if (date !== undefined) incomeData.date = date;
    if (note !== undefined) incomeData.note = note;

    const income = await IncomeService.updateIncome(req.params.id, incomeData, req.userId);
    res.json({
      success: true,
      data: income,
      message: 'Income updated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /incomes/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update income',
      message: error.message
    });
  }
});

// DELETE /:id - Delete income
router.delete('/:id', async (req, res) => {
  try {
    await IncomeService.deleteIncome(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Income deleted successfully'
    });
  } catch (error) {
    logger.error('Error in DELETE /incomes/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete income',
      message: error.message
    });
  }
});

export default router;