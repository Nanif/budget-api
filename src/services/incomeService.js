/**
 * Income service for database operations
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export class IncomeService {
  static async getAllIncomes(userId, filters = {}) {
    try {
      let query = supabase
        .from('incomes')
        .select('*')
        .eq('user_id', userId);

      // Apply filters
      if (filters.budgetYearId) {
        query = query.eq('budget_year_id', filters.budgetYearId);
      }
      if (filters.month) {
        query = query.eq('month', filters.month);
      }
      if (filters.year) {
        query = query.eq('year', filters.year);
      }
      if (filters.source) {
        query = query.ilike('source', `%${filters.source}%`);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,note.ilike.%${filters.search}%`);
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
      logger.error('Error fetching incomes:', error);
      throw error;
    }
  }

  static async getIncomeById(incomeId, userId) {
    try {
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .eq('id', incomeId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching income:', error);
      throw error;
    }
  }

  static async createIncome(incomeData, userId) {
    try {
      // Extract month and year from date
      const date = new Date(incomeData.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const { data, error } = await supabase
        .from('incomes')
        .insert([{
          ...incomeData,
          user_id: userId,
          month,
          year
        }])
        .select()
        .single();

      if (error) throw error;
      logger.info('Income created successfully:', data.id);
      return data;
    } catch (error) {
      logger.error('Error creating income:', error);
      throw error;
    }
  }

  static async updateIncome(incomeId, incomeData, userId) {
    try {
      // Update month and year if date is changed
      if (incomeData.date) {
        const date = new Date(incomeData.date);
        incomeData.month = date.getMonth() + 1;
        incomeData.year = date.getFullYear();
      }

      const { data, error } = await supabase
        .from('incomes')
        .update(incomeData)
        .eq('id', incomeId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Income updated successfully:', incomeId);
      return data;
    } catch (error) {
      logger.error('Error updating income:', error);
      throw error;
    }
  }

  static async deleteIncome(incomeId, userId) {
    try {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', incomeId)
        .eq('user_id', userId);

      if (error) throw error;
      logger.info('Income deleted successfully:', incomeId);
      return true;
    } catch (error) {
      logger.error('Error deleting income:', error);
      throw error;
    }
  }

  static async getIncomeSummary(userId, budgetYearId) {
    try {
      let query = supabase
        .from('incomes')
        .select('amount, source, month')
        .eq('user_id', userId);

      if (budgetYearId) {
        query = query.eq('budget_year_id', budgetYearId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate summary statistics
      const totalAmount = data.reduce((sum, income) => sum + parseFloat(income.amount), 0);
      const incomeCount = data.length;
      
      // Group by source
      const bySource = data.reduce((acc, income) => {
        const source = income.source || 'Other';
        if (!acc[source]) {
          acc[source] = { count: 0, total: 0 };
        }
        acc[source].count++;
        acc[source].total += parseFloat(income.amount);
        return acc;
      }, {});

      // Group by month
      const byMonth = data.reduce((acc, income) => {
        const month = income.month;
        if (!acc[month]) {
          acc[month] = { count: 0, total: 0 };
        }
        acc[month].count++;
        acc[month].total += parseFloat(income.amount);
        return acc;
      }, {});

      return {
        totalAmount,
        incomeCount,
        averageAmount: incomeCount > 0 ? totalAmount / incomeCount : 0,
        bySource,
        byMonth
      };
    } catch (error) {
      logger.error('Error getting income summary:', error);
      throw error;
    }
  }
  
}