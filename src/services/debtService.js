/**
 * Debt service for database operations
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export class DebtService {
  static async getAllDebts(userId, filters = {}) {
    try {
      let query = supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId);

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.isPaid !== undefined) {
        query = query.eq('is_paid', filters.isPaid);
      }
      if (filters.search) {
        query = query.or(`description.ilike.%${filters.search}%,note.ilike.%${filters.search}%`);
      }

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 50;
      const offset = (page - 1) * limit;

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching debts:', error);
      throw error;
    }
  }

  static async getDebtById(debtId, userId) {
    try {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('id', debtId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching debt:', error);
      throw error;
    }
  }

  static async createDebt(debtData, userId) {
    try {
      const { data, error } = await supabase
        .from('debts')
        .insert([{
          ...debtData,
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      logger.info('Debt created successfully:', data.id);
      return data;
    } catch (error) {
      logger.error('Error creating debt:', error);
      throw error;
    }
  }

  static async updateDebt(debtId, debtData, userId) {
    try {
      const { data, error } = await supabase
        .from('debts')
        .update(debtData)
        .eq('id', debtId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Debt updated successfully:', debtId);
      return data;
    } catch (error) {
      logger.error('Error updating debt:', error);
      throw error;
    }
  }

  static async markDebtAsPaid(debtId, userId) {
    try {
      const { data, error } = await supabase
        .from('debts')
        .update({ 
          is_paid: true, 
          paid_date: new Date().toISOString().split('T')[0] 
        })
        .eq('id', debtId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Debt marked as paid:', debtId);
      return data;
    } catch (error) {
      logger.error('Error marking debt as paid:', error);
      throw error;
    }
  }

  static async markDebtAsUnpaid(debtId, userId) {
    try {
      const { data, error } = await supabase
        .from('debts')
        .update({ 
          is_paid: false, 
          paid_date: null 
        })
        .eq('id', debtId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Debt marked as unpaid:', debtId);
      return data;
    } catch (error) {
      logger.error('Error marking debt as unpaid:', error);
      throw error;
    }
  }

  static async deleteDebt(debtId, userId) {
    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', debtId)
        .eq('user_id', userId);

      if (error) throw error;
      logger.info('Debt deleted successfully:', debtId);
      return true;
    } catch (error) {
      logger.error('Error deleting debt:', error);
      throw error;
    }
  }

  static async getDebtSummary(userId) {
    try {
      const { data, error } = await supabase
        .from('debts')
        .select('amount, type, is_paid')
        .eq('user_id', userId);

      if (error) throw error;

      const totalDebts = data.length;
      const paidDebts = data.filter(debt => debt.is_paid).length;
      const unpaidDebts = totalDebts - paidDebts;

      // Calculate amounts by type
      const owedToMe = data
        .filter(debt => debt.type === 'owed_to_me')
        .reduce((sum, debt) => sum + parseFloat(debt.amount), 0);
      
      const iOwe = data
        .filter(debt => debt.type === 'i_owe')
        .reduce((sum, debt) => sum + parseFloat(debt.amount), 0);

      // Calculate unpaid amounts
      const unpaidOwedToMe = data
        .filter(debt => debt.type === 'owed_to_me' && !debt.is_paid)
        .reduce((sum, debt) => sum + parseFloat(debt.amount), 0);
      
      const unpaidIOwe = data
        .filter(debt => debt.type === 'i_owe' && !debt.is_paid)
        .reduce((sum, debt) => sum + parseFloat(debt.amount), 0);

      const netBalance = owedToMe - iOwe;
      const unpaidNetBalance = unpaidOwedToMe - unpaidIOwe;

      return {
        totalDebts,
        paidDebts,
        unpaidDebts,
        owedToMe,
        iOwe,
        unpaidOwedToMe,
        unpaidIOwe,
        netBalance,
        unpaidNetBalance
      };
    } catch (error) {
      logger.error('Error getting debt summary:', error);
      throw error;
    }
  }
}