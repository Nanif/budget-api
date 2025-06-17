/**
 * Task API routes
 */

import express from 'express';
import { TaskService } from '../services/taskService.js';
import { getUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(getUserId);

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskInput:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: Task title
 *           example: "Complete project documentation"
 *         description:
 *           type: string
 *           description: Task description
 *           example: "Write comprehensive API documentation"
 *         important:
 *           type: boolean
 *           description: Whether the task is important
 *           example: true
 *     TaskUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Updated task title"
 *         description:
 *           type: string
 *           example: "Updated task description"
 *         completed:
 *           type: boolean
 *           example: true
 *         important:
 *           type: boolean
 *           example: false
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks with optional filters
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *       - in: query
 *         name: important
 *         schema:
 *           type: boolean
 *         description: Filter by importance
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
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
 *                     $ref: '#/components/schemas/Task'
 *                 message:
 *                   type: string
 *                   example: "Tasks retrieved successfully"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    console.log("fgdfgdsfgrfv");
    
    const filters = {
      completed: req.query.completed !== undefined ? req.query.completed === 'true' : undefined,
      important: req.query.important !== undefined ? req.query.important === 'true' : undefined,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };
    console.log("fgdfgdsfgrfv1111");

    const tasks = await TaskService.getAllTasks(req.userId, filters);
    logger.info("Tasks retrieved successfully", tasks);
    res.json({
      success: true,
      data: tasks,
      message: 'Tasks retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /api/tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tasks',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/tasks/summary:
 *   get:
 *     summary: Get task summary statistics
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Task summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTasks:
 *                       type: integer
 *                       example: 25
 *                     completedTasks:
 *                       type: integer
 *                       example: 15
 *                     pendingTasks:
 *                       type: integer
 *                       example: 10
 *                     importantTasks:
 *                       type: integer
 *                       example: 5
 *                     completionRate:
 *                       type: number
 *                       example: 60.0
 *                 message:
 *                   type: string
 *                   example: "Task summary retrieved successfully"
 */
router.get('/summary', async (req, res) => {
  try {
    const summary = await TaskService.getTaskSummary(req.userId);
    res.json({
      success: true,
      data: summary,
      message: 'Task summary retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /api/tasks/summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve task summary',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 message:
 *                   type: string
 *                   example: "Task retrieved successfully"
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res) => {
  try {
    const task = await TaskService.getTaskById(req.params.id, req.userId);
    res.json({
      success: true,
      data: task,
      message: 'Task retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /api/tasks/:id:', error);
    res.status(404).json({
      success: false,
      error: 'Task not found',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 message:
 *                   type: string
 *                   example: "Task created successfully"
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, important } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const taskData = {
      title,
      description: description || '',
      important: important || false
    };

    const task = await TaskService.createTask(taskData, req.userId);
    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error) {
    logger.error('Error in POST /api/tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdate'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 message:
 *                   type: string
 *                   example: "Task updated successfully"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, description, completed, important } = req.body;
    
    const taskData = {};
    if (title !== undefined) taskData.title = title;
    if (description !== undefined) taskData.description = description;
    if (completed !== undefined) taskData.completed = completed;
    if (important !== undefined) taskData.important = important;

    const task = await TaskService.updateTask(req.params.id, taskData, req.userId);
    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /api/tasks/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/tasks/{id}/toggle:
 *   patch:
 *     summary: Toggle task completion status
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task completion status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 message:
 *                   type: string
 *                   example: "Task completion status toggled successfully"
 */
router.patch('/:id/toggle', async (req, res) => {
  try {
    const task = await TaskService.toggleTaskCompletion(req.params.id, req.userId);
    res.json({
      success: true,
      data: task,
      message: 'Task completion status toggled successfully'
    });
  } catch (error) {
    logger.error('Error in PATCH /api/tasks/:id/toggle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle task completion',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', async (req, res) => {
  try {
    await TaskService.deleteTask(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    logger.error('Error in DELETE /api/tasks/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/tasks/completed/all:
 *   delete:
 *     summary: Delete all completed tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: All completed tasks deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 5
 *                 message:
 *                   type: string
 *                   example: "All completed tasks deleted successfully"
 */
router.delete('/completed/all', async (req, res) => {
  try {
    const result = await TaskService.deleteAllCompletedTasks(req.userId);
    res.json({
      success: true,
      data: result,
      message: 'All completed tasks deleted successfully'
    });
  } catch (error) {
    logger.error('Error in DELETE /api/tasks/completed/all:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete completed tasks',
      message: error.message
    });
  }
});

export default router;