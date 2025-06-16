/**
 * Application configuration
 */

export const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Application settings
  APP_NAME: process.env.APP_NAME || 'nodejs-app',
  APP_VERSION: process.env.APP_VERSION || '1.0.0',
  
  // Server settings (if needed)
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || 'localhost',
};

export default config;