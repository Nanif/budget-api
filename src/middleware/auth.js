/**
 * Authentication middleware
 */

import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // For demo purposes, we'll use a simple user ID from header
    // In production, verify JWT token here
    const userId = req.headers['x-user-id'] || 'demo-user-id';
    req.userId = userId;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(403).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

export const getUserId = (req, res, next) => {
  // For demo purposes, we'll use a header or default user
  const userId = req.headers['x-user-id'] || 'demo-user-id';
  req.userId = userId;
  
  logger.info(`Request from user: ${userId} to ${req.method} ${req.path}`);
  next();
};