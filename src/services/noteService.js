/**
 * Note service for database operations
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export class NoteService {
  /**
   * Get all notes for a user, with optional filters: search, page, limit
   * @param {Object} filters
   * @param {string} filters.search
   * @param {number} filters.page
   * @param {number} filters.limit
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  static async getAllNotes(filters = {}, userId) {
    try {
      logger.info(`Fetching notes for user: ${userId} with filters:`, filters);

      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters.search) {
        // Search in title or content
        query = query.ilike('title', `%${filters.search}%`)
          .or(`content.ilike.%${filters.search}%`);
      }

      if (filters.page && filters.limit) {
        const from = (Number(filters.page) - 1) * Number(filters.limit);
        const to = from + Number(filters.limit) - 1;
        query = query.range(from, to);
      } else if (filters.limit) {
        query = query.limit(Number(filters.limit));
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Supabase error in getAllNotes:', error);
        throw error;
      }

      logger.info(`Found ${data?.length || 0} notes for user: ${userId}`);
      return data || [];
    } catch (error) {
      logger.error('Error fetching notes:', error);
      throw error;
    }
  }

  /**
   * Get a single note by id
   * @param {string} noteId
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  static async getNoteById(noteId, userId) {
    try {
      logger.info(`Fetching note: ${noteId} for user: ${userId}`);

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', userId)
        .single();

      if (error) {
        logger.error('Supabase error in getNoteById:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error fetching note:', error);
      throw error;
    }
  }

  /**
   * Create a new note
   * @param {Object} noteData
   * @param {string} noteData.title
   * @param {string} noteData.content
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  static async createNote(noteData, userId) {
    try {
      logger.info(`Creating note for user: ${userId}`, noteData);

      const { data, error } = await supabase
        .from('notes')
        .insert([{
          ...noteData,
          user_id: userId
        }])
        .select()
        .single();

      if (error) {
        logger.error('Supabase error in createNote:', error);
        throw error;
      }

      logger.info('Note created successfully:', data.id);
      return data;
    } catch (error) {
      logger.error('Error creating note:', error);
      throw error;
    }
  }

  /**
   * Update an existing note
   * @param {string} noteId
   * @param {Object} noteData
   * @param {string} [noteData.title]
   * @param {string} [noteData.content]
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  static async updateNote(noteId, noteData, userId) {
    try {
      logger.info(`Updating note: ${noteId} for user: ${userId}`, noteData);

      const { data, error } = await supabase
        .from('notes')
        .update(noteData)
        .eq('id', noteId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Supabase error in updateNote:', error);
        throw error;
      }

      logger.info('Note updated successfully:', noteId);
      return data;
    } catch (error) {
      logger.error('Error updating note:', error);
      throw error;
    }
  }

  /**
   * Delete a note by id
   * @param {string} noteId
   * @param {string} userId
   * @returns {Promise<void>}
   */
  static async deleteNote(noteId, userId) {
    try {
      logger.info(`Deleting note: ${noteId} for user: ${userId}`);

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Supabase error in deleteNote:', error);
        throw error;
      }

      logger.info('Note deleted successfully:', noteId);
      return;
    } catch (error) {
      logger.error('Error deleting note:', error);
      throw error;
    }
  }
}
