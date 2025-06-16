/**
 * Family Budget Management API - Main application entry point
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/index.js';
import { specs } from './config/swagger.js';
import { logger } from './utils/logger.js';

// Import routes
import taskRoutes from './routes/taskRoutes.js';
import budgetYearRoutes from './routes/budgetYears.js';
import fundRoutes from './routes/funds.js';
import categoryRoutes from './routes/categories.js';
import incomeRoutes from './routes/incomes.js';
import expenseRoutes from './routes/expenses.js';
import titheRoutes from './routes/tithe.js';
import debtRoutes from './routes/debts.js';
import assetRoutes from './routes/assets.js';
import dashboardRoutes from './routes/dashboard.js';

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

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Family Budget API Documentation'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: config.APP_VERSION,
    service: 'Family Budget API'
  });
});

// API routes
app.use('/api/tasks', taskRoutes);
app.use('/api/budget-years', budgetYearRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/tithe', titheRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Family Budget Management API',
    version: config.APP_VERSION,
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      documentation: '/api-docs',
      dashboard: '/api/dashboard',
      tasks: '/api/tasks',
      budgetYears: '/api/budget-years',
      funds: '/api/funds',
      categories: '/api/categories',
      incomes: '/api/incomes',
      expenses: '/api/expenses',
      tithe: '/api/tithe',
      debts: '/api/debts',
      assets: '/api/assets'
    }
  });
});

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
      logger.info(`🚀 Family Budget API running on http://${host}:${port}`);
      logger.info(`📊 Health check: http://${host}:${port}/health`);
      logger.info(`📚 API Documentation: http://${host}:${port}/api-docs`);
      logger.info(`📝 API Endpoints: http://${host}:${port}/`);
      logger.info(`Environment: ${config.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
startServer();