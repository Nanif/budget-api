/**
 * Expense service for database operations
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export class ExpenseService {
  static async getFundSpent(fundId, budgetYearId, userId) {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .eq('fund_id', fundId)
      .eq('budget_year_id', budgetYearId)
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []).reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }

  static async getAllExpenses(userId, filters = {}) {
    try {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          categories(name, color_class),
          funds(name, type, color_class)
        `)
        .eq('user_id', userId);

      // Apply filters
      if (filters.budgetYearId) {
        query = query.eq('budget_year_id', filters.budgetYearId);
      }
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters.fundId) {
        query = query.eq('fund_id', filters.fundId);
      }
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters.minAmount) {
        query = query.gte('amount', filters.minAmount);
      }
      if (filters.maxAmount) {
        query = query.lte('amount', filters.maxAmount);
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
      logger.error('Error fetching expenses:', error);
      throw error;
    }
  }

  static async getExpenseById(expenseId, userId) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          categories(name, color_class),
          funds(name, type)
        `)
        .eq('id', expenseId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching expense:', error);
      throw error;
    }
  }

  static async createExpense(expenseData, userId) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          ...expenseData,
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      logger.info('Expense created successfully:', data.id);
      return data;
    } catch (error) {
      logger.error('Error creating expense:', error);
      throw error;
    }
  }

  static async updateExpense(expenseId, expenseData, userId) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', expenseId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Expense updated successfully:', expenseId);
      return data;
    } catch (error) {
      logger.error('Error updating expense:', error);
      throw error;
    }
  }

  static async deleteExpense(expenseId, userId) {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .eq('user_id', userId);

      if (error) throw error;
      logger.info('Expense deleted successfully:', expenseId);
      return true;
    } catch (error) {
      logger.error('Error deleting expense:', error);
      throw error;
    }
  }

  static async getExpenseSummary(userId, budgetYearId) {
    try {
      let query = supabase
        .from('expenses')
        .select(`
          amount,
          date,
          categories(name),
          funds(name, type)
        `)
        .eq('user_id', userId);

      if (budgetYearId) {
        query = query.eq('budget_year_id', budgetYearId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate summary statistics
      const totalAmount = data.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      const expenseCount = data.length;
      
      // Group by category
      const byCategory = data.reduce((acc, expense) => {
        const category = expense.categories?.name || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = { count: 0, total: 0 };
        }
        acc[category].count++;
        acc[category].total += parseFloat(expense.amount);
        return acc;
      }, {});

      // Group by fund
      const byFund = data.reduce((acc, expense) => {
        const fund = expense.funds?.name || 'Unknown';
        if (!acc[fund]) {
          acc[fund] = { count: 0, total: 0 };
        }
        acc[fund].count++;
        acc[fund].total += parseFloat(expense.amount);
        return acc;
      }, {});

      // Group by month
      const byMonth = data.reduce((acc, expense) => {
        const date = new Date(expense.date);
        const month = date.getMonth() + 1;
        if (!acc[month]) {
          acc[month] = { count: 0, total: 0 };
        }
        acc[month].count++;
        acc[month].total += parseFloat(expense.amount);
        return acc;
      }, {});

      return {
        totalAmount,
        expenseCount,
        averageAmount: expenseCount > 0 ? totalAmount / expenseCount : 0,
        byCategory,
        byFund,
        byMonth
      };
    } catch (error) {
      logger.error('Error getting expense summary:', error);
      throw error;
    }
  }
}