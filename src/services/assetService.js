/**
 * Asset service for database operations
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export class AssetService {
  static async getAllAssetSnapshots(userId, filters = {}) {
    try {
      let query = supabase
        .from('asset_snapshots')
        .select(`
          *,
          asset_details(*)
        `)
        .eq('user_id', userId);

      // Apply filters
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const offset = (page - 1) * limit;

      query = query
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching asset snapshots:', error);
      throw error;
    }
  }

  static async getLatestAssetSnapshot(userId) {
    try {
      const { data, error } = await supabase
        .from('asset_snapshots')
        .select(`
          *,
          asset_details(*)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching latest asset snapshot:', error);
      throw error;
    }
  }

  static async getAssetSnapshotById(snapshotId, userId) {
    try {
      const { data, error } = await supabase
        .from('asset_snapshots')
        .select(`
          *,
          asset_details(*)
        `)
        .eq('id', snapshotId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching asset snapshot:', error);
      throw error;
    }
  }

  static async createAssetSnapshot(snapshotData, userId) {
    try {
      const { asset_details, ...snapshotInfo } = snapshotData;

      // Create the snapshot
      const { data: snapshot, error: snapshotError } = await supabase
        .from('asset_snapshots')
        .insert([{
          ...snapshotInfo,
          user_id: userId
        }])
        .select()
        .single();

      if (snapshotError) throw snapshotError;

      // Create asset details if provided
      if (asset_details && asset_details.length > 0) {
        const detailsWithSnapshotId = asset_details.map(detail => ({
          ...detail,
          snapshot_id: snapshot.id
        }));

        const { data: details, error: detailsError } = await supabase
          .from('asset_details')
          .insert(detailsWithSnapshotId)
          .select();

        if (detailsError) throw detailsError;
        snapshot.asset_details = details;
      }

      logger.info('Asset snapshot created successfully:', snapshot.id);
      return snapshot;
    } catch (error) {
      logger.error('Error creating asset snapshot:', error);
      throw error;
    }
  }

  static async updateAssetSnapshot(snapshotId, snapshotData, userId) {
    try {
      const { asset_details, ...snapshotInfo } = snapshotData;

      // Update the snapshot
      const { data: snapshot, error: snapshotError } = await supabase
        .from('asset_snapshots')
        .update(snapshotInfo)
        .eq('id', snapshotId)
        .eq('user_id', userId)
        .select()
        .single();

      if (snapshotError) throw snapshotError;

      // Update asset details if provided
      if (asset_details && asset_details.length > 0) {
        // Delete existing details
        await supabase
          .from('asset_details')
          .delete()
          .eq('snapshot_id', snapshotId);

        // Insert new details
        const detailsWithSnapshotId = asset_details.map(detail => ({
          ...detail,
          snapshot_id: snapshotId
        }));

        const { data: details, error: detailsError } = await supabase
          .from('asset_details')
          .insert(detailsWithSnapshotId)
          .select();

        if (detailsError) throw detailsError;
        snapshot.asset_details = details;
      }

      logger.info('Asset snapshot updated successfully:', snapshotId);
      return snapshot;
    } catch (error) {
      logger.error('Error updating asset snapshot:', error);
      throw error;
    }
  }

  static async deleteAssetSnapshot(snapshotId, userId) {
    try {
      const { error } = await supabase
        .from('asset_snapshots')
        .delete()
        .eq('id', snapshotId)
        .eq('user_id', userId);

      if (error) throw error;
      logger.info('Asset snapshot deleted successfully:', snapshotId);
      return true;
    } catch (error) {
      logger.error('Error deleting asset snapshot:', error);
      throw error;
    }
  }

  static async getAssetTrends(userId, limit = 12) {
    try {
      const { data, error } = await supabase
        .from('asset_snapshots')
        .select(`
          date,
          asset_details(amount, category)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Calculate trends
      const trends = data.map(snapshot => {
        const totalAssets = snapshot.asset_details
          .filter(detail => detail.category === 'asset')
          .reduce((sum, detail) => sum + parseFloat(detail.amount), 0);
        
        const totalLiabilities = snapshot.asset_details
          .filter(detail => detail.category === 'liability')
          .reduce((sum, detail) => sum + parseFloat(detail.amount), 0);

        return {
          date: snapshot.date,
          totalAssets,
          totalLiabilities,
          netWorth: totalAssets - totalLiabilities
        };
      }).reverse(); // Reverse to get chronological order

      // Calculate growth rates
      const trendsWithGrowth = trends.map((trend, index) => {
        if (index === 0) {
          return { ...trend, growthRate: 0 };
        }
        
        const previousNetWorth = trends[index - 1].netWorth;
        const growthRate = previousNetWorth !== 0 
          ? ((trend.netWorth - previousNetWorth) / Math.abs(previousNetWorth)) * 100 
          : 0;

        return { ...trend, growthRate };
      });

      return {
        trends: trendsWithGrowth,
        summary: {
          currentNetWorth: trendsWithGrowth[trendsWithGrowth.length - 1]?.netWorth || 0,
          averageGrowthRate: trendsWithGrowth.length > 1 
            ? trendsWithGrowth.slice(1).reduce((sum, t) => sum + t.growthRate, 0) / (trendsWithGrowth.length - 1)
            : 0
        }
      };
    } catch (error) {
      logger.error('Error getting asset trends:', error);
      throw error;
    }
  }
}