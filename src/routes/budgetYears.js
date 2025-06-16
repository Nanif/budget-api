/**
 * Budget Years API routes
 */

import express from 'express';
import { BudgetYearService } from '../services/budgetYearService.js';
import { getUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(getUserId);

// GET / - Get all budget years
router.get('/', async (req, res) => {
  try {
    const budgetYears = await BudgetYearService.getAllBudgetYears(req.userId);
    res.json({
      success: true,
      data: budgetYears,
      message: 'Budget years retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /budgetYears:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve budget years',
      message: error.message
    });
  }
});

// GET /active - Get active budget year
router.get('/active', async (req, res) => {
  try {
    const budgetYear = await BudgetYearService.getActiveBudgetYear(req.userId);
    res.json({
      success: true,
      data: budgetYear,
      message: 'Active budget year retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /budgetYears/active:', error);
    res.status(404).json({
      success: false,
      error: 'No active budget year found',
      message: error.message
    });
  }
});

// GET /:id - Get specific budget year
router.get('/:id', async (req, res) => {
  try {
    const budgetYear = await BudgetYearService.getBudgetYearById(req.params.id, req.userId);
    res.json({
      success: true,
      data: budgetYear,
      message: 'Budget year retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /budgetYears/:id:', error);
    res.status(404).json({
      success: false,
      error: 'Budget year not found',
      message: error.message
    });
  }
});

// POST / - Create new budget year
router.post('/', async (req, res) => {
  try {
    const { name, start_date, end_date, is_active } = req.body;
    
    if (!name || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Name, start_date, and end_date are required'
      });
    }

    const budgetYearData = {
      name,
      start_date,
      end_date,
      is_active: is_active || false
    };

    const budgetYear = await BudgetYearService.createBudgetYear(budgetYearData, req.userId);
    res.status(201).json({
      success: true,
      data: budgetYear,
      message: 'Budget year created successfully'
    });
  } catch (error) {
    logger.error('Error in POST /budgetYears:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create budget year',
      message: error.message
    });
  }
});

// PUT /:id - Update budget year
router.put('/:id', async (req, res) => {
  try {
    const { name, start_date, end_date, is_active } = req.body;
    
    const budgetYearData = {};
    if (name !== undefined) budgetYearData.name = name;
    if (start_date !== undefined) budgetYearData.start_date = start_date;
    if (end_date !== undefined) budgetYearData.end_date = end_date;
    if (is_active !== undefined) budgetYearData.is_active = is_active;

    const budgetYear = await BudgetYearService.updateBudgetYear(req.params.id, budgetYearData, req.userId);
    res.json({
      success: true,
      data: budgetYear,
      message: 'Budget year updated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /budgetYears/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update budget year',
      message: error.message
    });
  }
});

// PUT /:id/activate - Activate budget year
router.put('/:id/activate', async (req, res) => {
  try {
    const budgetYear = await BudgetYearService.activateBudgetYear(req.params.id, req.userId);
    res.json({
      success: true,
      data: budgetYear,
      message: 'Budget year activated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /budgetYears/:id/activate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate budget year',
      message: error.message
    });
  }
});

// DELETE /:id - Delete budget year
router.delete('/:id', async (req, res) => {
  try {
    await BudgetYearService.deleteBudgetYear(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Budget year deleted successfully'
    });
  } catch (error) {
    logger.error('Error in DELETE /budgetYears/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete budget year',
      message: error.message
    });
  }
});

export default router;