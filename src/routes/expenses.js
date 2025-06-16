/**
 * Expenses API routes
 */

import express from 'express';
import { ExpenseService } from '../services/expenseService.js';
import { getUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(getUserId);

// GET / - Get all expenses with filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      budgetYearId: req.query.budgetYearId,
      categoryId: req.query.categoryId,
      fundId: req.query.fundId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      minAmount: req.query.minAmount,
      maxAmount: req.query.maxAmount,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };

    const expenses = await ExpenseService.getAllExpenses(req.userId, filters);
    res.json({
      success: true,
      data: expenses,
      message: 'Expenses retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /expenses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve expenses',
      message: error.message
    });
  }
});

// GET /stats/summary - Get expense statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { budgetYearId } = req.query;
    const summary = await ExpenseService.getExpenseSummary(req.userId, budgetYearId);
    res.json({
      success: true,
      data: summary,
      message: 'Expense summary retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /expenses/stats/summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve expense summary',
      message: error.message
    });
  }
});

// GET /:id - Get specific expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await ExpenseService.getExpenseById(req.params.id, req.userId);
    res.json({
      success: true,
      data: expense,
      message: 'Expense retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /expenses/:id:', error);
    res.status(404).json({
      success: false,
      error: 'Expense not found',
      message: error.message
    });
  }
});

// POST / - Create new expense
router.post('/', async (req, res) => {
  try {
    const { name, amount, budget_year_id, category_id, fund_id, date, note } = req.body;
    
    if (!name || !amount || !budget_year_id || !category_id || !fund_id || !date) {
      return res.status(400).json({
        success: false,
        error: 'Name, amount, budget_year_id, category_id, fund_id, and date are required'
      });
    }

    const expenseData = {
      name,
      amount,
      budget_year_id,
      category_id,
      fund_id,
      date,
      note
    };

    const expense = await ExpenseService.createExpense(expenseData, req.userId);
    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense created successfully'
    });
  } catch (error) {
    logger.error('Error in POST /expenses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create expense',
      message: error.message
    });
  }
});

// PUT /:id - Update expense
router.put('/:id', async (req, res) => {
  try {
    const { name, amount, budget_year_id, category_id, fund_id, date, note } = req.body;
    
    const expenseData = {};
    if (name !== undefined) expenseData.name = name;
    if (amount !== undefined) expenseData.amount = amount;
    if (budget_year_id !== undefined) expenseData.budget_year_id = budget_year_id;
    if (category_id !== undefined) expenseData.category_id = category_id;
    if (fund_id !== undefined) expenseData.fund_id = fund_id;
    if (date !== undefined) expenseData.date = date;
    if (note !== undefined) expenseData.note = note;

    const expense = await ExpenseService.updateExpense(req.params.id, expenseData, req.userId);
    res.json({
      success: true,
      data: expense,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /expenses/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update expense',
      message: error.message
    });
  }
});

// DELETE /:id - Delete expense
router.delete('/:id', async (req, res) => {
  try {
    await ExpenseService.deleteExpense(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    logger.error('Error in DELETE /expenses/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete expense',
      message: error.message
    });
  }
});

export default router;