/**
 * Tithe API routes
 */

import express from 'express';
import { TitheService } from '../services/titheService.js';
import { getUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(getUserId);

// GET / - Get all tithes with filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };

    const tithes = await TitheService.getAllTithes(req.userId, filters);
    res.json({
      success: true,
      data: tithes,
      message: 'Tithes retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /tithe:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tithes',
      message: error.message
    });
  }
});

// GET /summary - Get tithe summary
router.get('/summary', async (req, res) => {
  try {
    const summary = await TitheService.getTitheSummary(req.userId);
    res.json({
      success: true,
      data: summary,
      message: 'Tithe summary retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /tithe/summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tithe summary',
      message: error.message
    });
  }
});

// GET /:id - Get specific tithe
router.get('/:id', async (req, res) => {
  try {
    const tithe = await TitheService.getTitheById(req.params.id, req.userId);
    res.json({
      success: true,
      data: tithe,
      message: 'Tithe retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /tithe/:id:', error);
    res.status(404).json({
      success: false,
      error: 'Tithe not found',
      message: error.message
    });
  }
});

// POST / - Create new tithe
router.post('/', async (req, res) => {
  try {
    const { description, amount, date, note } = req.body;
    
    if (!description || !amount || !date) {
      return res.status(400).json({
        success: false,
        error: 'Description, amount, and date are required'
      });
    }

    const titheData = {
      description,
      amount,
      date,
      note
    };

    const tithe = await TitheService.createTithe(titheData, req.userId);
    res.status(201).json({
      success: true,
      data: tithe,
      message: 'Tithe created successfully'
    });
  } catch (error) {
    logger.error('Error in POST /tithe:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create tithe',
      message: error.message
    });
  }
});

// PUT /:id - Update tithe
router.put('/:id', async (req, res) => {
  try {
    const { description, amount, date, note } = req.body;
    
    const titheData = {};
    if (description !== undefined) titheData.description = description;
    if (amount !== undefined) titheData.amount = amount;
    if (date !== undefined) titheData.date = date;
    if (note !== undefined) titheData.note = note;

    const tithe = await TitheService.updateTithe(req.params.id, titheData, req.userId);
    res.json({
      success: true,
      data: tithe,
      message: 'Tithe updated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /tithe/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update tithe',
      message: error.message
    });
  }
});

// DELETE /:id - Delete tithe
router.delete('/:id', async (req, res) => {
  try {
    await TitheService.deleteTithe(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Tithe deleted successfully'
    });
  } catch (error) {
    logger.error('Error in DELETE /tithe/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete tithe',
      message: error.message
    });
  }
});

export default router;