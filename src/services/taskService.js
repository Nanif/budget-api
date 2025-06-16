/**
 * Task service for database operations
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export class TaskService {
  /**
   * Get all tasks for a user
   */
  static async getAllTasks(userId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Get a single task by ID
   */
  static async getTaskById(taskId, userId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching task:', error);
      throw error;
    }
  }

  /**
   * Create a new task
   */
  static async createTask(taskData, userId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      logger.info('Task created successfully:', data.id);
      return data;
    } catch (error) {
      logger.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   */
  static async updateTask(taskId, taskData, userId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Task updated successfully:', taskId);
      return data;
    } catch (error) {
      logger.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId, userId) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) throw error;
      logger.info('Task deleted successfully:', taskId);
      return true;
    } catch (error) {
      logger.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Toggle task completion status
   */
  static async toggleTaskCompletion(taskId, userId) {
    try {
      // First get the current task
      const currentTask = await this.getTaskById(taskId, userId);
      
      // Toggle the completed status
      const { data, error } = await supabase
        .from('tasks')
        .update({ completed: !currentTask.completed })
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Task completion toggled:', taskId);
      return data;
    } catch (error) {
      logger.error('Error toggling task completion:', error);
      throw error;
    }
  }
}

export default TaskService;