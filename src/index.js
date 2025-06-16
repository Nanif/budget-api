/**
 * Main application entry point
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import taskRoutes from './routes/taskRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: config.APP_VERSION
  });
});

// API routes
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
async function startServer() {
  try {
    const port = config.PORT;
    const host = config.HOST;
    
    app.listen(port, host, () => {
      logger.info(`🚀 Server running on http://${host}:${port}`);
      logger.info(`📊 Health check: http://${host}:${port}/health`);
      logger.info(`📝 Tasks API: http://${host}:${port}/api/tasks`);
      logger.info(`Environment: ${config.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
startServer();