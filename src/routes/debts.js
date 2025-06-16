/**
 * Debts API routes
 */

import express from 'express';
import { DebtService } from '../services/debtService.js';
import { getUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(getUserId);

// GET / - Get all debts with filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      isPaid: req.query.isPaid !== undefined ? req.query.isPaid === 'true' : undefined,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };

    const debts = await DebtService.getAllDebts(req.userId, filters);
    res.json({
      success: true,
      data: debts,
      message: 'Debts retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /debts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve debts',
      message: error.message
    });
  }
});

// GET /summary - Get debt summary
router.get('/summary', async (req, res) => {
  try {
    const summary = await DebtService.getDebtSummary(req.userId);
    res.json({
      success: true,
      data: summary,
      message: 'Debt summary retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /debts/summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve debt summary',
      message: error.message
    });
  }
});

// GET /:id - Get specific debt
router.get('/:id', async (req, res) => {
  try {
    const debt = await DebtService.getDebtById(req.params.id, req.userId);
    res.json({
      success: true,
      data: debt,
      message: 'Debt retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /debts/:id:', error);
    res.status(404).json({
      success: false,
      error: 'Debt not found',
      message: error.message
    });
  }
});

// POST / - Create new debt
router.post('/', async (req, res) => {
  try {
    const { description, amount, type, note } = req.body;
    
    if (!description || !amount || !type) {
      return res.status(400).json({
        success: false,
        error: 'Description, amount, and type are required'
      });
    }

    if (!['owed_to_me', 'i_owe'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either "owed_to_me" or "i_owe"'
      });
    }

    const debtData = {
      description,
      amount,
      type,
      note
    };

    const debt = await DebtService.createDebt(debtData, req.userId);
    res.status(201).json({
      success: true,
      data: debt,
      message: 'Debt created successfully'
    });
  } catch (error) {
    logger.error('Error in POST /debts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create debt',
      message: error.message
    });
  }
});

// PUT /:id - Update debt
router.put('/:id', async (req, res) => {
  try {
    const { description, amount, type, note, is_paid, paid_date } = req.body;
    
    const debtData = {};
    if (description !== undefined) debtData.description = description;
    if (amount !== undefined) debtData.amount = amount;
    if (type !== undefined) {
      if (!['owed_to_me', 'i_owe'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Type must be either "owed_to_me" or "i_owe"'
        });
      }
      debtData.type = type;
    }
    if (note !== undefined) debtData.note = note;
    if (is_paid !== undefined) debtData.is_paid = is_paid;
    if (paid_date !== undefined) debtData.paid_date = paid_date;

    const debt = await DebtService.updateDebt(req.params.id, debtData, req.userId);
    res.json({
      success: true,
      data: debt,
      message: 'Debt updated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /debts/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update debt',
      message: error.message
    });
  }
});

// PUT /:id/pay - Mark debt as paid
router.put('/:id/pay', async (req, res) => {
  try {
    const debt = await DebtService.markDebtAsPaid(req.params.id, req.userId);
    res.json({
      success: true,
      data: debt,
      message: 'Debt marked as paid successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /debts/:id/pay:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark debt as paid',
      message: error.message
    });
  }
});

// PUT /:id/unpay - Mark debt as unpaid
router.put('/:id/unpay', async (req, res) => {
  try {
    const debt = await DebtService.markDebtAsUnpaid(req.params.id, req.userId);
    res.json({
      success: true,
      data: debt,
      message: 'Debt marked as unpaid successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /debts/:id/unpay:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark debt as unpaid',
      message: error.message
    });
  }
});

// DELETE /:id - Delete debt
router.delete('/:id', async (req, res) => {
  try {
    await DebtService.deleteDebt(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Debt deleted successfully'
    });
  } catch (error) {
    logger.error('Error in DELETE /debts/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete debt',
      message: error.message
    });
  }
});

export default router;