/**
 * Budget Years API routes
 */

import express from 'express';
import { BudgetYearService } from '../services/budgetYearService.js';
import { getUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(getUserId);

/**
 * @swagger
 * tags:
 *   name: Budget Years
 *   description: Budget year management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BudgetYearInput:
 *       type: object
 *       required:
 *         - name
 *         - start_date
 *         - end_date
 *       properties:
 *         name:
 *           type: string
 *           description: Budget year name
 *           example: "01/25 - 12/25"
 *         start_date:
 *           type: string
 *           format: date
 *           description: Budget year start date
 *           example: "2025-01-01"
 *         end_date:
 *           type: string
 *           format: date
 *           description: Budget year end date
 *           example: "2025-12-31"
 *         is_active:
 *           type: boolean
 *           description: Whether this budget year is active
 *           example: true
 */

/**
 * @swagger
 * /api/budget-years:
 *   get:
 *     summary: Get all budget years
 *     tags: [Budget Years]
 *     responses:
 *       200:
 *         description: Budget years retrieved successfully
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
 *                     $ref: '#/components/schemas/BudgetYear'
 *                 message:
 *                   type: string
 *                   example: "Budget years retrieved successfully"
 */
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

/**
 * @swagger
 * /api/budget-years/active:
 *   get:
 *     summary: Get the active budget year
 *     tags: [Budget Years]
 *     responses:
 *       200:
 *         description: Active budget year retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BudgetYear'
 *                 message:
 *                   type: string
 *                   example: "Active budget year retrieved successfully"
 *       404:
 *         description: No active budget year found
 */
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

/**
 * @swagger
 * /api/budget-years/{id}:
 *   get:
 *     summary: Get a specific budget year
 *     tags: [Budget Years]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Budget year ID
 *     responses:
 *       200:
 *         description: Budget year retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BudgetYear'
 *                 message:
 *                   type: string
 *                   example: "Budget year retrieved successfully"
 *       404:
 *         description: Budget year not found
 */
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

/**
 * @swagger
 * /api/budget-years:
 *   post:
 *     summary: Create a new budget year
 *     tags: [Budget Years]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Budget year name
 *                 example: "01/25 - 12/25"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Budget year start date
 *                 example: "2025-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Budget year end date
 *                 example: "2025-12-31"
 *               is_active:
 *                 type: boolean
 *                 description: Whether this budget year is active
 *                 example: true
 *     responses:
 *       201:
 *         description: Budget year created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BudgetYear'
 *                 message:
 *                   type: string
 *                   example: "Budget year created successfully"
 *       400:
 *         description: Bad request - missing required fields
 */
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

/**
 * @swagger
 * /api/budget-years/{id}:
 *   put:
 *     summary: Update a budget year
 *     tags: [Budget Years]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Budget year ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "01/25 - 12/25"
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Budget year updated successfully
 */
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

/**
 * @swagger
 * /api/budget-years/{id}/activate:
 *   put:
 *     summary: Activate a budget year (deactivates all others)
 *     tags: [Budget Years]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Budget year ID
 *     responses:
 *       200:
 *         description: Budget year activated successfully
 */
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

/**
 * @swagger
 * /api/budget-years/{id}:
 *   delete:
 *     summary: Delete a budget year
 *     tags: [Budget Years]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Budget year ID
 *     responses:
 *       200:
 *         description: Budget year deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
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