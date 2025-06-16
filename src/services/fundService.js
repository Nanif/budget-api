/**
 * Fund service for database operations
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export class FundService {
  static async getAllFunds(userId, budgetYearId = null) {
    try {
      let query = supabase
        .from('funds')
        .select(`
          *,
          fund_budgets!inner(
            id,
            budget_year_id,
            amount,
            amount_given,
            spent
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (budgetYearId) {
        query = query.eq('fund_budgets.budget_year_id', budgetYearId);
      }

      const { data, error } = await query.order('display_order');

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching funds:', error);
      throw error;
    }
  }

  static async getFundById(fundId, userId) {
    try {
      const { data, error } = await supabase
        .from('funds')
        .select(`
          *,
          fund_budgets(*)
        `)
        .eq('id', fundId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching fund:', error);
      throw error;
    }
  }

  static async createFund(fundData, userId) {
    try {
      const { data, error } = await supabase
        .from('funds')
        .insert([{
          ...fundData,
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      logger.info('Fund created successfully:', data.id);
      return data;
    } catch (error) {
      logger.error('Error creating fund:', error);
      throw error;
    }
  }

  static async updateFund(fundId, fundData, userId) {
    try {
      const { data, error } = await supabase
        .from('funds')
        .update(fundData)
        .eq('id', fundId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Fund updated successfully:', fundId);
      return data;
    } catch (error) {
      logger.error('Error updating fund:', error);
      throw error;
    }
  }

  static async updateFundBudget(fundId, budgetYearId, amount, userId) {
    try {
      const { data, error } = await supabase
        .from('fund_budgets')
        .upsert({
          fund_id: fundId,
          budget_year_id: budgetYearId,
          amount: amount
        })
        .select()
        .single();

      if (error) throw error;
      logger.info('Fund budget updated successfully:', fundId);
      return data;
    } catch (error) {
      logger.error('Error updating fund budget:', error);
      throw error;
    }
  }

  static async deactivateFund(fundId, userId) {
    try {
      const { data, error } = await supabase
        .from('funds')
        .update({ is_active: false })
        .eq('id', fundId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Fund deactivated successfully:', fundId);
      return data;
    } catch (error) {
      logger.error('Error deactivating fund:', error);
      throw error;
    }
  }

  static async activateFund(fundId, userId) {
    try {
      const { data, error } = await supabase
        .from('funds')
        .update({ is_active: true })
        .eq('id', fundId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Fund activated successfully:', fundId);
      return data;
    } catch (error) {
      logger.error('Error activating fund:', error);
      throw error;
    }
  }

  static async deleteFund(fundId, userId) {
    try {
      const { error } = await supabase
        .from('funds')
        .delete()
        .eq('id', fundId)
        .eq('user_id', userId);

      if (error) throw error;
      logger.info('Fund deleted successfully:', fundId);
      return true;
    } catch (error) {
      logger.error('Error deleting fund:', error);
      throw error;
    }
  }
}