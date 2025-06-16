/**
 * Assets API routes
 */

import express from 'express';
import { AssetService } from '../services/assetService.js';
import { getUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(getUserId);

// GET / - Get all asset snapshots with filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: req.query.page,
      limit: req.query.limit
    };

    const snapshots = await AssetService.getAllAssetSnapshots(req.userId, filters);
    res.json({
      success: true,
      data: snapshots,
      message: 'Asset snapshots retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /assets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve asset snapshots',
      message: error.message
    });
  }
});

// GET /latest - Get latest asset snapshot
router.get('/latest', async (req, res) => {
  try {
    const snapshot = await AssetService.getLatestAssetSnapshot(req.userId);
    res.json({
      success: true,
      data: snapshot,
      message: 'Latest asset snapshot retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /assets/latest:', error);
    res.status(404).json({
      success: false,
      error: 'No asset snapshots found',
      message: error.message
    });
  }
});

// GET /trends/summary - Get asset trends
router.get('/trends/summary', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const trends = await AssetService.getAssetTrends(req.userId, limit);
    res.json({
      success: true,
      data: trends,
      message: 'Asset trends retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /assets/trends/summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve asset trends',
      message: error.message
    });
  }
});

// GET /:id - Get specific asset snapshot
router.get('/:id', async (req, res) => {
  try {
    const snapshot = await AssetService.getAssetSnapshotById(req.params.id, req.userId);
    res.json({
      success: true,
      data: snapshot,
      message: 'Asset snapshot retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /assets/:id:', error);
    res.status(404).json({
      success: false,
      error: 'Asset snapshot not found',
      message: error.message
    });
  }
});

// POST / - Create new asset snapshot
router.post('/', async (req, res) => {
  try {
    const { date, note, asset_details } = req.body;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date is required'
      });
    }

    // Validate asset details if provided
    if (asset_details && Array.isArray(asset_details)) {
      for (const detail of asset_details) {
        if (!detail.asset_type || !detail.asset_name || detail.amount === undefined || !detail.category) {
          return res.status(400).json({
            success: false,
            error: 'Each asset detail must have asset_type, asset_name, amount, and category'
          });
        }
        if (!['asset', 'liability'].includes(detail.category)) {
          return res.status(400).json({
            success: false,
            error: 'Asset category must be either "asset" or "liability"'
          });
        }
      }
    }

    const snapshotData = {
      date,
      note,
      asset_details
    };

    const snapshot = await AssetService.createAssetSnapshot(snapshotData, req.userId);
    res.status(201).json({
      success: true,
      data: snapshot,
      message: 'Asset snapshot created successfully'
    });
  } catch (error) {
    logger.error('Error in POST /assets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create asset snapshot',
      message: error.message
    });
  }
});

// PUT /:id - Update asset snapshot
router.put('/:id', async (req, res) => {
  try {
    const { date, note, asset_details } = req.body;
    
    const snapshotData = {};
    if (date !== undefined) snapshotData.date = date;
    if (note !== undefined) snapshotData.note = note;
    if (asset_details !== undefined) {
      // Validate asset details if provided
      if (Array.isArray(asset_details)) {
        for (const detail of asset_details) {
          if (!detail.asset_type || !detail.asset_name || detail.amount === undefined || !detail.category) {
            return res.status(400).json({
              success: false,
              error: 'Each asset detail must have asset_type, asset_name, amount, and category'
            });
          }
          if (!['asset', 'liability'].includes(detail.category)) {
            return res.status(400).json({
              success: false,
              error: 'Asset category must be either "asset" or "liability"'
            });
          }
        }
      }
      snapshotData.asset_details = asset_details;
    }

    const snapshot = await AssetService.updateAssetSnapshot(req.params.id, snapshotData, req.userId);
    res.json({
      success: true,
      data: snapshot,
      message: 'Asset snapshot updated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /assets/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update asset snapshot',
      message: error.message
    });
  }
});

// DELETE /:id - Delete asset snapshot
router.delete('/:id', async (req, res) => {
  try {
    await AssetService.deleteAssetSnapshot(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Asset snapshot deleted successfully'
    });
  } catch (error) {
    logger.error('Error in DELETE /assets/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete asset snapshot',
      message: error.message
    });
  }
});

export default router;