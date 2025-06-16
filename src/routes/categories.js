/**
 * Categories API routes
 */

import express from 'express';
import { CategoryService } from '../services/categoryService.js';
import { getUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(getUserId);

// GET / - Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await CategoryService.getAllCategories(req.userId);
    res.json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve categories',
      message: error.message
    });
  }
});

// GET /fund/:fundId - Get categories by fund
router.get('/fund/:fundId', async (req, res) => {
  try {
    const categories = await CategoryService.getCategoriesByFund(req.params.fundId, req.userId);
    res.json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /categories/fund/:fundId:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve categories',
      message: error.message
    });
  }
});

// GET /:id - Get specific category
router.get('/:id', async (req, res) => {
  try {
    const category = await CategoryService.getCategoryById(req.params.id, req.userId);
    res.json({
      success: true,
      data: category,
      message: 'Category retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /categories/:id:', error);
    res.status(404).json({
      success: false,
      error: 'Category not found',
      message: error.message
    });
  }
});

// POST / - Create new category
router.post('/', async (req, res) => {
  try {
    const { name, fund_id, color_class } = req.body;
    
    if (!name || !fund_id) {
      return res.status(400).json({
        success: false,
        error: 'Name and fund_id are required'
      });
    }

    const categoryData = {
      name,
      fund_id,
      color_class: color_class || null
    };

    const category = await CategoryService.createCategory(categoryData, req.userId);
    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    logger.error('Error in POST /categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category',
      message: error.message
    });
  }
});

// PUT /:id - Update category
router.put('/:id', async (req, res) => {
  try {
    const { name, fund_id, color_class, is_active } = req.body;
    
    const categoryData = {};
    if (name !== undefined) categoryData.name = name;
    if (fund_id !== undefined) categoryData.fund_id = fund_id;
    if (color_class !== undefined) categoryData.color_class = color_class;
    if (is_active !== undefined) categoryData.is_active = is_active;

    const category = await CategoryService.updateCategory(req.params.id, categoryData, req.userId);
    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /categories/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category',
      message: error.message
    });
  }
});

// PUT /:id/deactivate - Deactivate category
router.put('/:id/deactivate', async (req, res) => {
  try {
    const category = await CategoryService.deactivateCategory(req.params.id, req.userId);
    res.json({
      success: true,
      data: category,
      message: 'Category deactivated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /categories/:id/deactivate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate category',
      message: error.message
    });
  }
});

// PUT /:id/activate - Activate category
router.put('/:id/activate', async (req, res) => {
  try {
    const category = await CategoryService.activateCategory(req.params.id, req.userId);
    res.json({
      success: true,
      data: category,
      message: 'Category activated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /categories/:id/activate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate category',
      message: error.message
    });
  }
});

// DELETE /:id - Delete category
router.delete('/:id', async (req, res) => {
  try {
    await CategoryService.deleteCategory(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    logger.error('Error in DELETE /categories/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category',
      message: error.message
    });
  }
});

export default router;