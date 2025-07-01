/**
 * System Settings API routes
 */

import express from 'express';
import { SystemSettingsService } from '../services/SystemSettingsService.js';
import { getUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(getUserId);

// GET / - Get all settings with filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      setting_key: req.query.setting_key,
      data_type: req.query.data_type,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };

    const settings = await SystemSettingsService.getAllSettings(req.userId, filters);
    res.json({
      success: true,
      data: settings,
      message: 'System settings retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /system-settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system settings',
      message: error.message
    });
  }
});

// GET /by-type/:dataType - Get settings by data type
router.get('/by-type/:dataType', async (req, res) => {
  try {
    const settings = await SystemSettingsService.getSettingsByType(req.userId, req.params.dataType);
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('Error in GET /system-settings/by-type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve settings by type',
      message: error.message
    });
  }
});

// GET /key/:settingKey - Get setting by key
router.get('/key/:settingKey', async (req, res) => {
  try {
    const setting = await SystemSettingsService.getSettingByKey(req.userId, req.params.settingKey);
    if (!setting) {
      return res.status(404).json({ success: false, error: 'Setting not found' });
    }
    res.json({ success: true, data: setting });
  } catch (error) {
    logger.error('Error in GET /system-settings/key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve setting',
      message: error.message
    });
  }
});

// GET /:id - Get setting by id
router.get('/:id', async (req, res) => {
  try {
    const setting = await SystemSettingsService.getSettingById(req.userId, req.params.id);
    if (!setting) {
      return res.status(404).json({ success: false, error: 'Setting not found' });
    }
    res.json({ success: true, data: setting });
  } catch (error) {
    logger.error('Error in GET /system-settings/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve setting',
      message: error.message
    });
  }
});

// POST / - Create new setting
router.post('/', async (req, res) => {
  try {
    const newSetting = await SystemSettingsService.createSetting(req.userId, req.body);
    res.status(201).json({
      success: true,
      data: newSetting,
      message: 'Setting created successfully'
    });
  } catch (error) {
    logger.error('Error in POST /system-settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create setting',
      message: error.message
    });
  }
});

// PUT /:id - Update setting by ID
router.put('/:id', async (req, res) => {
  try {
    const updated = await SystemSettingsService.updateSettingById(req.userId, req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('Error in PUT /system-settings/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update setting',
      message: error.message
    });
  }
});

// PUT /key/:settingKey - Update setting by key
router.put('/key/:settingKey', async (req, res) => {
  try {
    const updated = await SystemSettingsService.updateSettingByKey(req.userId, req.params.settingKey, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('Error in PUT /system-settings/key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update setting by key',
      message: error.message
    });
  }
});

// DELETE /:id - Delete setting by ID
router.delete('/:id', async (req, res) => {
  try {
    await SystemSettingsService.deleteSettingById(req.userId, req.params.id);
    res.json({ success: true, message: 'Setting deleted successfully' });
  } catch (error) {
    logger.error('Error in DELETE /system-settings/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete setting',
      message: error.message
    });
  }
});

// DELETE /key/:settingKey - Delete setting by key
router.delete('/key/:settingKey', async (req, res) => {
  try {
    await SystemSettingsService.deleteSettingByKey(req.userId, req.params.settingKey);
    res.json({ success: true, message: 'Setting deleted successfully' });
  } catch (error) {
    logger.error('Error in DELETE /system-settings/key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete setting by key',
      message: error.message
    });
  }
});

export default router;
