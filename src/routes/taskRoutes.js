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
 * GET /api/tasks - Get all tasks with filters
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      completed: req.query.completed !== undefined ? req.query.completed === 'true' : undefined,
      important: req.query.important !== undefined ? req.query.important === 'true' : undefined,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };

    const tasks = await TaskService.getAllTasks(req.userId, filters);
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
 * GET /api/tasks/summary - Get task summary
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
 * GET /api/tasks/:id - Get a specific task
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
 * POST /api/tasks - Create a new task
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
 * PUT /api/tasks/:id - Update a task
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
 * PATCH /api/tasks/:id/toggle - Toggle task completion
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
 * DELETE /api/tasks/:id - Delete a task
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
 * DELETE /api/tasks/completed/all - Delete all completed tasks
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