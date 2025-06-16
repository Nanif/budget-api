/**
 * Tithe service for database operations
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export class TitheService {
  static async getAllTithes(userId, filters = {}) {
    try {
      let query = supabase
        .from('tithe_given')
        .select('*')
        .eq('user_id', userId);

      // Apply filters
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters.search) {
        query = query.or(`description.ilike.%${filters.search}%,note.ilike.%${filters.search}%`);
      }

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 50;
      const offset = (page - 1) * limit;

      query = query
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching tithes:', error);
      throw error;
    }
  }

  static async getTitheById(titheId, userId) {
    try {
      const { data, error } = await supabase
        .from('tithe_given')
        .select('*')
        .eq('id', titheId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching tithe:', error);
      throw error;
    }
  }

  static async createTithe(titheData, userId) {
    try {
      const { data, error } = await supabase
        .from('tithe_given')
        .insert([{
          ...titheData,
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      logger.info('Tithe created successfully:', data.id);
      return data;
    } catch (error) {
      logger.error('Error creating tithe:', error);
      throw error;
    }
  }

  static async updateTithe(titheId, titheData, userId) {
    try {
      const { data, error } = await supabase
        .from('tithe_given')
        .update(titheData)
        .eq('id', titheId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Tithe updated successfully:', titheId);
      return data;
    } catch (error) {
      logger.error('Error updating tithe:', error);
      throw error;
    }
  }

  static async deleteTithe(titheId, userId) {
    try {
      const { error } = await supabase
        .from('tithe_given')
        .delete()
        .eq('id', titheId)
        .eq('user_id', userId);

      if (error) throw error;
      logger.info('Tithe deleted successfully:', titheId);
      return true;
    } catch (error) {
      logger.error('Error deleting tithe:', error);
      throw error;
    }
  }

  static async getTitheSummary(userId) {
    try {
      // Get total tithes given
      const { data: titheData, error: titheError } = await supabase
        .from('tithe_given')
        .select('amount, date')
        .eq('user_id', userId);

      if (titheError) throw titheError;

      // Get total income for tithe calculation
      const { data: incomeData, error: incomeError } = await supabase
        .from('incomes')
        .select('amount')
        .eq('user_id', userId);

      if (incomeError) throw incomeError;

      const totalTitheGiven = titheData.reduce((sum, tithe) => sum + parseFloat(tithe.amount), 0);
      const totalIncome = incomeData.reduce((sum, income) => sum + parseFloat(income.amount), 0);
      const titheCount = titheData.length;

      // Calculate tithe percentage
      const tithePercentage = totalIncome > 0 ? (totalTitheGiven / totalIncome) * 100 : 0;

      // Expected tithe (10%)
      const expectedTithe = totalIncome * 0.1;
      const titheBalance = totalTitheGiven - expectedTithe;

      // Group by year
      const byYear = titheData.reduce((acc, tithe) => {
        const year = new Date(tithe.date).getFullYear();
        if (!acc[year]) {
          acc[year] = { count: 0, total: 0 };
        }
        acc[year].count++;
        acc[year].total += parseFloat(tithe.amount);
        return acc;
      }, {});

      return {
        totalTitheGiven,
        totalIncome,
        titheCount,
        tithePercentage,
        expectedTithe,
        titheBalance,
        averageTithe: titheCount > 0 ? totalTitheGiven / titheCount : 0,
        byYear
      };
    } catch (error) {
      logger.error('Error getting tithe summary:', error);
      throw error;
    }
  }
}