/**
 * Categories API routes
 */

import express from 'express';
import { CategoryService } from '../services/categoryService.js';
import { getUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(getUserId);

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management endpoints
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *                 message:
 *                   type: string
 *                   example: "Categories retrieved successfully"
 */
router.get('/', async (req, res) => {
  try {
    logger.info(`GET /categories - User: ${req.userId}`);
    
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
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @swagger
 * /api/categories/fund/{fundId}:
 *   get:
 *     summary: Get categories by fund
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: fundId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Fund ID
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/fund/:fundId', async (req, res) => {
  try {
    logger.info(`GET /categories/fund/${req.params.fundId} - User: ${req.userId}`);
    
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
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get specific category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 */
router.get('/:id', async (req, res) => {
  try {
    logger.info(`GET /categories/${req.params.id} - User: ${req.userId}`);
    
    const category = await CategoryService.getCategoryById(req.params.id, req.userId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category,
      message: 'Category retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /categories/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve category',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - fund_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Groceries"
 *               fund_id:
 *                 type: string
 *                 format: uuid
 *               color_class:
 *                 type: string
 *                 example: "bg-green-100 text-green-800 border-green-300"
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post('/', async (req, res) => {
  try {
    const { name, fund_id, color_class } = req.body;
    
    logger.info(`POST /categories - User: ${req.userId}`, { name, fund_id });
    
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
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// PUT /:id - Update category
router.put('/:id', async (req, res) => {
  try {
    const { name, fund_id, color_class, is_active } = req.body;
    
    logger.info(`PUT /categories/${req.params.id} - User: ${req.userId}`, req.body);
    
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
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// PUT /:id/deactivate - Deactivate category
router.put('/:id/deactivate', async (req, res) => {
  try {
    logger.info(`PUT /categories/${req.params.id}/deactivate - User: ${req.userId}`);
    
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
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// PUT /:id/activate - Activate category
router.put('/:id/activate', async (req, res) => {
  try {
    logger.info(`PUT /categories/${req.params.id}/activate - User: ${req.userId}`);
    
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
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// DELETE /:id - Delete category
router.delete('/:id', async (req, res) => {
  try {
    logger.info(`DELETE /categories/${req.params.id} - User: ${req.userId}`);
    
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
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;