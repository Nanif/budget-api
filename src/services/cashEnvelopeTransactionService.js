/**
 * Cash Envelope Transactions service
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export class CashEnvelopeTransactionService {
  static async createTransaction(transactionData, userId) {
    try {
      const { date } = transactionData;
      const d = new Date(date);
      const month = transactionData.month ?? (d.getMonth() + 1);
      const year = transactionData.year ?? d.getFullYear();

      const payload = {
        ...transactionData,
        user_id: userId,
        month,
        year
      };

      const { data, error } = await supabase
        .from('cash_envelope_transactions')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      logger.info('Cash envelope transaction created:', data.id);
      return data;
    } catch (error) {
      logger.error('Error creating cash envelope transaction:', error);
      throw error;
    }
  }

  static async getTransactionsByMonth(userId, budgetYearId, month) {
    try {
      const { data, error } = await supabase
        .from('cash_envelope_transactions')
        .select(`
          *,
          funds(name, type, color_class)
        `)
        .eq('user_id', userId)
        .eq('budget_year_id', budgetYearId)
        .eq('month', month)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching cash envelope transactions:', error);
      throw error;
    }
  }
}

export default CashEnvelopeTransactionService;

