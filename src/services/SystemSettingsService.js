/**
 * System Settings service
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export class SystemSettingsService {
  static async getAllSettings(userId, filters = {}) {
    try {
      let query = supabase
        .from('system_settings')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (filters.setting_key) {
        query = query.eq('setting_key', filters.setting_key);
      }

      if (filters.data_type) {
        query = query.eq('data_type', filters.data_type);
      }

      if (filters.search) {
        query = query.or(`setting_key.ilike.%${filters.search}%,setting_value.ilike.%${filters.search}%`);
      }

      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 50;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to).order('updated_at', { ascending: false });

      const { data, count, error } = await query;
      if (error) throw error;

      return {
        data,
        total: count,
        page,
        limit,
        hasMore: count > to + 1
      };
    } catch (error) {
      logger.error('Error fetching settings:', error);
      throw error;
    }
  }

  static async getSettingsByType(userId, dataType) {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('data_type', dataType);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching settings by type:', error);
      throw error;
    }
  }

  static async getSettingByKey(userId, key) {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('setting_key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching setting by key:', error);
      throw error;
    }
  }

  static async getSettingById(userId, id) {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error('Error fetching setting by ID:', error);
      throw error;
    }
  }

  static async createSetting(userId, setting) {
    try {
      const { setting_key, setting_value, data_type = 'string' } = setting;

      if (!setting_key || setting_value === undefined)
        throw new Error('setting_key and setting_value are required');

      const { data, error } = await supabase
        .from('system_settings')
        .insert([{
          user_id: userId,
          setting_key,
          setting_value: typeof setting_value === 'object' ? JSON.stringify(setting_value) : String(setting_value),
          data_type
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating setting:', error);
      throw error;
    }
  }

  static async updateSettingById(userId, id, setting) {
    try {
      const { setting_value, data_type, setting_key } = setting;

      const updates = {};
      if (setting_key !== undefined) updates.setting_key = setting_key;
      if (setting_value !== undefined)
        updates.setting_value = typeof setting_value === 'object' ? JSON.stringify(setting_value) : String(setting_value);
      if (data_type !== undefined) updates.data_type = data_type;

      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('system_settings')
        .update(updates)
        .eq('user_id', userId)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating setting by ID:', error);
      throw error;
    }
  }

  static async updateSettingByKey(userId, key, setting) {
    try {
      const { setting_value, data_type } = setting;

      const updates = {
        setting_value: typeof setting_value === 'object' ? JSON.stringify(setting_value) : String(setting_value),
        data_type,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('system_settings')
        .update(updates)
        .eq('user_id', userId)
        .eq('setting_key', key)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating setting by key:', error);
      throw error;
    }
  }

  static async deleteSettingById(userId, id) {
    try {
      const { error } = await supabase
        .from('system_settings')
        .delete()
        .eq('user_id', userId)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      logger.error('Error deleting setting by ID:', error);
      throw error;
    }
  }

  static async deleteSettingByKey(userId, key) {
    try {
      const { error } = await supabase
        .from('system_settings')
        .delete()
        .eq('user_id', userId)
        .eq('setting_key', key);

      if (error) throw error;
    } catch (error) {
      logger.error('Error deleting setting by key:', error);
      throw error;
    }
  }
}
