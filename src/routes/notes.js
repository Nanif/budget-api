/**
 * Notes API routes
 */

import express from 'express';
import { NoteService } from '../services/noteService.js';
import { getUserId } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(getUserId);

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Note management endpoints
 */

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get all notes
 *     tags: [Notes]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title/content
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (for pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of notes per page
 *     responses:
 *       200:
 *         description: Notes retrieved successfully
 */
router.get('/', async (req, res) => {
  try {
    logger.info(`GET /notes - User: ${req.userId}`);

    const filters = {
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };

    const notes = await NoteService.getAllNotes(filters, req.userId);

    res.json({
      success: true,
      data: notes,
      message: 'Notes retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /notes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve notes',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Get specific note
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note retrieved successfully
 *       404:
 *         description: Note not found
 */
router.get('/:id', async (req, res) => {
  try {
    logger.info(`GET /notes/${req.params.id} - User: ${req.userId}`);

    const note = await NoteService.getNoteById(req.params.id, req.userId);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    res.json({
      success: true,
      data: note,
      message: 'Note retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in GET /notes/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve note',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create new note
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "כותרת"
 *               content:
 *                 type: string
 *                 example: "תוכן"
 *     responses:
 *       201:
 *         description: Note created successfully
 */
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;

    logger.info(`POST /notes - User: ${req.userId}`, { title });

    // if (!title || !content) {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Title and content are required'
    //   });
    // }

    const noteData = { title, content };

    const note = await NoteService.createNote(noteData, req.userId);
    res.status(201).json({
      success: true,
      data: note,
      message: 'Note created successfully'
    });
  } catch (error) {
    logger.error('Error in POST /notes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create note',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Update note
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated successfully
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;

    logger.info(`PUT /notes/${req.params.id} - User: ${req.userId}`, req.body);

    const noteData = {};
    if (title !== undefined) noteData.title = title;
    if (content !== undefined) noteData.content = content;

    const note = await NoteService.updateNote(req.params.id, noteData, req.userId);
    res.json({
      success: true,
      data: note,
      message: 'Note updated successfully'
    });
  } catch (error) {
    logger.error('Error in PUT /notes/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update note',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete note
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note deleted successfully
 */
router.delete('/:id', async (req, res) => {
  try {
    logger.info(`DELETE /notes/${req.params.id} - User: ${req.userId}`);

    await NoteService.deleteNote(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    logger.error('Error in DELETE /notes/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete note',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
