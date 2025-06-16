/**
 * Funds API routes
 */

import express from 'express';
import { FundService } from '../services/fundService.js';
import { getUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(getUserId);

// GET / - Get all funds
router.get('/', async (req, res) => {
  try {
    const { budgetYearId } = req.query;
    const funds = await FundService.getAllFunds(req.userId, budgetYearId);
    res.json({
      success: true,
      data: funds,
      message: 'Funds retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /funds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve funds',
      message: error.message
    });
  }
});

// GET /:id - Get specific fund
router.get('/:id', async (req, res) => {
  try {
    const fund = await FundService.getFundById(req.params.id, req.userId);
    res.json({
      success: true,
      data: fund,
      message: 'Fund retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /funds/:id:', error);
    res.status(404).json({
      success: false,
      error: 'Fund not found',
      message: error.message
    });
  }
});

// POST / - Create new fund
router.post('/', async (req, res) => {
  try {
    const { name, type, level, include_in_budget, display_order } = req.body;
    
    if (!name || !type || !level) {
      return res.status(400).json({
        success: false,
        error: 'Name, type, and level are required'
      });
    }

    const fundData = {
      name,
      type,
      level,
      include_in_budget: include_in_budget !== undefined ? include_in_budget : true,
      display_order: display_order || 0
    };

    const fund = await FundService.createFund(fundData, req.userId);
    res.status(201).json({
      success: true,
      data: fund,
      message: 'Fund created successfully'
    });
  } catch (error) {
    logger.error('Error in POST /funds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create fund',
      message: error.message
    });
  }
});

// PUT /:id - Update fund
router.put('/:id', async (req, res) => {
  try {
    const { name, type, level, include_in_budget, display_order, is_active } = req.body;
    
    const fundData = {};
    if (name !== undefined) fundData.name = name;
    if (type !== undefined) fundData.type = type;
    if (level !== undefined) fundData.level = level;
    if (include_in_budget !== undefined) fundData.include_in_budget = include_in_budget;
    if (display_order !== undefined) fundData.display_order = display_order;
    if (is_active !== undefined) fundData.is_active = is_active;

    const fund = await FundService.updateFund(req.params.id, fundData, req.userId);
    res.json({
      success: true,
      data: fund,
      message: 'Fund updated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /funds/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update fund',
      message: error.message
    });
  }
});

// PUT /:id/budget/:budgetYearId - Update fund budget
router.put('/:id/budget/:budgetYearId', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (amount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required'
      });
    }

    const fundBudget = await FundService.updateFundBudget(
      req.params.id, 
      req.params.budgetYearId, 
      amount, 
      req.userId
    );
    res.json({
      success: true,
      data: fundBudget,
      message: 'Fund budget updated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /funds/:id/budget/:budgetYearId:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update fund budget',
      message: error.message
    });
  }
});

// PUT /:id/deactivate - Deactivate fund
router.put('/:id/deactivate', async (req, res) => {
  try {
    const fund = await FundService.deactivateFund(req.params.id, req.userId);
    res.json({
      success: true,
      data: fund,
      message: 'Fund deactivated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /funds/:id/deactivate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate fund',
      message: error.message
    });
  }
});

// PUT /:id/activate - Activate fund
router.put('/:id/activate', async (req, res) => {
  try {
    const fund = await FundService.activateFund(req.params.id, req.userId);
    res.json({
      success: true,
      data: fund,
      message: 'Fund activated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /funds/:id/activate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate fund',
      message: error.message
    });
  }
});

// DELETE /:id - Delete fund
router.delete('/:id', async (req, res) => {
  try {
    await FundService.deleteFund(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Fund deleted successfully'
    });
  } catch (error) {
    logger.error('Error in DELETE /funds/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete fund',
      message: error.message
    });
  }
});

export default router;