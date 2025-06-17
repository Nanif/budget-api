/**
 * Supabase configuration and client setup
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

logger.info('Initializing Supabase client...');
logger.info(`Supabase URL: ${supabaseUrl}`);

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test connection
supabase
  .from('users')
  .select('count', { count: 'exact', head: true })
  .then(({ error, count }) => {
    if (error) {
      logger.error('Supabase connection test failed:', error);
    } else {
      logger.info(`Supabase connected successfully. Users table has ${count} records.`);
    }
  });

export default supabase;