/**
 * Task service for database operations
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export class TaskService {
  /**
   * Get all tasks for a user with filters
   */
  static async getAllTasks(userId, filters = {}) {
    try {
      console.log('🟡 getAllTasks called with userId:', userId);
      console.log('🟡 Filters received:', filters);
  
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);
  
      // Apply filters
      if (filters.completed !== undefined) {
        console.log('🔵 Applying filter: completed =', filters.completed);
        query = query.eq('completed', filters.completed);
      }
      if (filters.important !== undefined) {
        console.log('🔵 Applying filter: important =', filters.important);
        query = query.eq('important', filters.important);
      }
      if (filters.search) {
        console.log('🔵 Applying search filter:', filters.search);
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
  
      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 50;
      const offset = (page - 1) * limit;
  
      console.log(`🔵 Applying pagination: page=${page}, limit=${limit}, offset=${offset}`);
  
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
  
      const { data, error } = await query;
  
      if (error) {
        console.error('🔴 Supabase query error:', error);
        throw error;
      }
  
      console.log('🟢 Tasks fetched successfully. Count:', data?.length || 0);
      return data;
    } catch (error) {
      console.error('🔴 Error in getAllTasks:', error);
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
      // Handle completion timestamp
      if (taskData.completed !== undefined) {
        taskData.completed_at = taskData.completed ? new Date().toISOString() : null;
      }

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
        .update({ 
          completed: !currentTask.completed,
          completed_at: !currentTask.completed ? new Date().toISOString() : null
        })
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

  /**
   * Delete all completed tasks
   */
  static async deleteAllCompletedTasks(userId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', userId)
        .eq('completed', true)
        .select();

      if (error) throw error;
      logger.info(`Deleted ${data.length} completed tasks for user:`, userId);
      return { deletedCount: data.length };
    } catch (error) {
      logger.error('Error deleting completed tasks:', error);
      throw error;
    }
  }

  /**
   * Get task summary
   */
  static async getTaskSummary(userId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('completed, important')
        .eq('user_id', userId);

      if (error) throw error;

      const totalTasks = data.length;
      const completedTasks = data.filter(task => task.completed).length;
      const pendingTasks = totalTasks - completedTasks;
      const importantTasks = data.filter(task => task.important && !task.completed).length;

      return {
        totalTasks,
        completedTasks,
        pendingTasks,
        importantTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      };
    } catch (error) {
      logger.error('Error getting task summary:', error);
      throw error;
    }
  }
}

export default TaskService;