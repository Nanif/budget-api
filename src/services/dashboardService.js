/**
 * Dashboard service for aggregated data operations
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export class DashboardService {
  static async getDashboardSummary(userId, budgetYearId) {
    try {
      // Get active budget year if not provided
      let activeBudgetYear = null;
      if (budgetYearId) {
        const { data: budgetYear } = await supabase
          .from('budget_years')
          .select('*')
          .eq('id', budgetYearId)
          .eq('user_id', userId)
          .single();
        activeBudgetYear = budgetYear;
      } else {
        const { data: budgetYear } = await supabase
          .from('budget_years')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();
        activeBudgetYear = budgetYear;
        budgetYearId = budgetYear?.id;
      }

      // Parallel queries for better performance
      const [
        incomeData,
        expenseData,
        fundData,
        debtData,
        taskData,
        titheData,
        assetData
      ] = await Promise.all([
        // Income summary
        supabase
          .from('incomes')
          .select('amount')
          .eq('user_id', userId)
          .eq('budget_year_id', budgetYearId || ''),

        // Expense summary with recent expenses
        supabase
          .from('expenses')
          .select(`
            amount,
            name,
            date,
            categories(name, color_class)
          `)
          .eq('user_id', userId)
          .eq('budget_year_id', budgetYearId || '')
          .order('date', { ascending: false }),

        // Fund budgets
        supabase
          .from('fund_budgets')
          .select(`
            amount,
            amount_given,
            spent,
            funds(name, type, include_in_budget)
          `)
          .eq('budget_year_id', budgetYearId || ''),

        // Debt summary
        supabase
          .from('debts')
          .select('amount, type, is_paid')
          .eq('user_id', userId),

        // Task summary
        supabase
          .from('tasks')
          .select('completed, important')
          .eq('user_id', userId),

        // Tithe summary
        supabase
          .from('tithe_given')
          .select('amount')
          .eq('user_id', userId),

        // Latest asset snapshot
        supabase
          .from('asset_snapshots')
          .select(`
            date,
            asset_details(amount, category)
          `)
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(1)
          .single()
      ]);

      // Process income data
      const totalIncome = incomeData.data?.reduce((sum, income) => 
        sum + parseFloat(income.amount), 0) || 0;

      // Process expense data
      const totalExpenses = expenseData.data?.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0) || 0;
      const recentExpenses = expenseData.data?.slice(0, 10) || [];

      // Process fund data
      let totalBudget = 0;
      let totalAllocated = 0;
      let totalSpent = 0;
      
      if (fundData.data && activeBudgetYear) {
        const budgetMonths = this.calculateBudgetMonths(activeBudgetYear.start_date, activeBudgetYear.end_date);
        
        fundData.data.forEach(fundBudget => {
          if (fundBudget.funds?.include_in_budget) {
            const budgetAmount = parseFloat(fundBudget.amount);
            if (fundBudget.funds.type === 'monthly') {
              totalBudget += budgetAmount * budgetMonths;
              totalAllocated += parseFloat(fundBudget.amount_given || 0);
            } else {
              totalBudget += budgetAmount;
              totalSpent += parseFloat(fundBudget.spent || 0);
            }
          }
        });
      }

      // Process debt data
      const owedToMe = debtData.data?.filter(debt => debt.type === 'owed_to_me' && !debt.is_paid)
        .reduce((sum, debt) => sum + parseFloat(debt.amount), 0) || 0;
      const iOwe = debtData.data?.filter(debt => debt.type === 'i_owe' && !debt.is_paid)
        .reduce((sum, debt) => sum + parseFloat(debt.amount), 0) || 0;

      // Process task data
      const totalTasks = taskData.data?.length || 0;
      const completedTasks = taskData.data?.filter(task => task.completed).length || 0;
      const importantTasks = taskData.data?.filter(task => task.important && !task.completed).length || 0;

      // Process tithe data
      const totalTithe = titheData.data?.reduce((sum, tithe) => 
        sum + parseFloat(tithe.amount), 0) || 0;
      const expectedTithe = totalIncome * 0.1;

      // Process asset data
      let netWorth = 0;
      if (assetData.data?.asset_details) {
        const totalAssets = assetData.data.asset_details
          .filter(detail => detail.category === 'asset')
          .reduce((sum, detail) => sum + parseFloat(detail.amount), 0);
        const totalLiabilities = assetData.data.asset_details
          .filter(detail => detail.category === 'liability')
          .reduce((sum, detail) => sum + parseFloat(detail.amount), 0);
        netWorth = totalAssets - totalLiabilities;
      }

      return {
        budgetYear: activeBudgetYear,
        income: {
          total: totalIncome
        },
        expenses: {
          total: totalExpenses,
          recent: recentExpenses
        },
        budget: {
          total: totalBudget,
          allocated: totalAllocated,
          spent: totalSpent,
          remaining: totalBudget - totalAllocated - totalSpent
        },
        balance: totalIncome - totalExpenses,
        debts: {
          owedToMe,
          iOwe,
          netDebt: owedToMe - iOwe
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: totalTasks - completedTasks,
          important: importantTasks
        },
        tithe: {
          given: totalTithe,
          expected: expectedTithe,
          balance: totalTithe - expectedTithe,
          percentage: totalIncome > 0 ? (totalTithe / totalIncome) * 100 : 0
        },
        assets: {
          netWorth,
          lastUpdated: assetData.data?.date
        }
      };
    } catch (error) {
      logger.error('Error getting dashboard summary:', error);
      throw error;
    }
  }

  static calculateBudgetMonths(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth()) + 1;
    return Math.max(1, months);
  }
}