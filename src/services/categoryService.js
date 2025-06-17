/**
 * Category service for database operations
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export class CategoryService {
  static async getAllCategories(userId) {
    try {
      logger.info(`Fetching categories for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          funds(name, type)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        logger.error('Supabase error in getAllCategories:', error);
        throw error;
      }
      
      logger.info(`Found ${data?.length || 0} categories for user: ${userId}`);
      return data || [];
    } catch (error) {
      logger.error('Error fetching categories:', error);
      throw error;
    }
  }

  static async getCategoriesByFund(fundId, userId) {
    try {
      logger.info(`Fetching categories for fund: ${fundId}, user: ${userId}`);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('fund_id', fundId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        logger.error('Supabase error in getCategoriesByFund:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      logger.error('Error fetching categories by fund:', error);
      throw error;
    }
  }

  static async getCategoryById(categoryId, userId) {
    try {
      logger.info(`Fetching category: ${categoryId} for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          funds(name, type)
        `)
        .eq('id', categoryId)
        .eq('user_id', userId)
        .single();

      if (error) {
        logger.error('Supabase error in getCategoryById:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      logger.error('Error fetching category:', error);
      throw error;
    }
  }

  static async createCategory(categoryData, userId) {
    try {
      logger.info(`Creating category for user: ${userId}`, categoryData);
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          ...categoryData,
          user_id: userId
        }])
        .select()
        .single();

      if (error) {
        logger.error('Supabase error in createCategory:', error);
        throw error;
      }
      
      logger.info('Category created successfully:', data.id);
      return data;
    } catch (error) {
      logger.error('Error creating category:', error);
      throw error;
    }
  }

  static async updateCategory(categoryId, categoryData, userId) {
    try {
      logger.info(`Updating category: ${categoryId} for user: ${userId}`, categoryData);
      
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', categoryId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Supabase error in updateCategory:', error);
        throw error;
      }
      
      logger.info('Category updated successfully:', categoryId);
      return data;
    } catch (error) {
      logger.error('Error updating category:', error);
      throw error;
    }
  }

  static async deactivateCategory(categoryId, userId) {
    try {
      logger.info(`Deactivating category: ${categoryId} for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', categoryId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Supabase error in deactivateCategory:', error);
        throw error;
      }
      
      logger.info('Category deactivated successfully:', categoryId);
      return data;
    } catch (error) {
      logger.error('Error deactivating category:', error);
      throw error;
    }
  }

  static async activateCategory(categoryId, userId) {
    try {
      logger.info(`Activating category: ${categoryId} for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('categories')
        .update({ is_active: true })
        .eq('id', categoryId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Supabase error in activateCategory:', error);
        throw error;
      }
      
      logger.info('Category activated successfully:', categoryId);
      return data;
    } catch (error) {
      logger.error('Error activating category:', error);
      throw error;
    }
  }

  static async deleteCategory(categoryId, userId) {
    try {
      logger.info(`Deleting category: ${categoryId} for user: ${userId}`);
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Supabase error in deleteCategory:', error);
        throw error;
      }
      
      logger.info('Category deleted successfully:', categoryId);
      return true;
    } catch (error) {
      logger.error('Error deleting category:', error);
      throw error;
    }
  }
}