/**
 * Budget Year service for database operations
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export class BudgetYearService {
  static async getAllBudgetYears(userId) {
    try {
      const { data, error } = await supabase
        .from('budget_years')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching budget years:', error);
      throw error;
    }
  }

  static async getActiveBudgetYear(userId) {
    try {
      const { data, error } = await supabase
        .from('budget_years')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching active budget year:', error);
      throw error;
    }
  }

  static async getBudgetYearById(budgetYearId, userId) {
    try {
      const { data, error } = await supabase
        .from('budget_years')
        .select('*')
        .eq('id', budgetYearId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching budget year:', error);
      throw error;
    }
  }

  static async createBudgetYear(budgetYearData, userId) {
    try {
      const { data, error } = await supabase
        .from('budget_years')
        .insert([{
          ...budgetYearData,
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      logger.info('Budget year created successfully:', data.id);
      return data;
    } catch (error) {
      logger.error('Error creating budget year:', error);
      throw error;
    }
  }

  static async updateBudgetYear(budgetYearId, budgetYearData, userId) {
    try {
      const { data, error } = await supabase
        .from('budget_years')
        .update(budgetYearData)
        .eq('id', budgetYearId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Budget year updated successfully:', budgetYearId);
      return data;
    } catch (error) {
      logger.error('Error updating budget year:', error);
      throw error;
    }
  }

  static async activateBudgetYear(budgetYearId, userId) {
    try {
      // First deactivate all other budget years
      await supabase
        .from('budget_years')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Then activate the selected one
      const { data, error } = await supabase
        .from('budget_years')
        .update({ is_active: true })
        .eq('id', budgetYearId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Budget year activated successfully:', budgetYearId);
      return data;
    } catch (error) {
      logger.error('Error activating budget year:', error);
      throw error;
    }
  }

  static async deleteBudgetYear(budgetYearId, userId) {
    try {
      const { error } = await supabase
        .from('budget_years')
        .delete()
        .eq('id', budgetYearId)
        .eq('user_id', userId);

      if (error) throw error;
      logger.info('Budget year deleted successfully:', budgetYearId);
      return true;
    } catch (error) {
      logger.error('Error deleting budget year:', error);
      throw error;
    }
  }
}