/**
 * Swagger configuration for API documentation
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Family Budget Management API',
      version: '1.0.0',
      description: 'A comprehensive REST API for managing family budget with Supabase integration',
      contact: {
        name: 'API Support',
        email: 'support@familybudget.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-user-id',
          description: 'User ID for authentication (demo purposes)'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Error message'
            },
            message: {
              type: 'string',
              example: 'Detailed error description'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            }
          }
        },
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            title: {
              type: 'string',
              example: 'Complete project documentation'
            },
            description: {
              type: 'string',
              example: 'Write comprehensive API documentation'
            },
            completed: {
              type: 'boolean',
              example: false
            },
            important: {
              type: 'boolean',
              example: true
            },
            user_id: {
              type: 'string',
              format: 'uuid'
            },
            completed_at: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        BudgetYear: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            user_id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: '01/25 - 12/25'
            },
            start_date: {
              type: 'string',
              format: 'date',
              example: '2025-01-01'
            },
            end_date: {
              type: 'string',
              format: 'date',
              example: '2025-12-31'
            },
            is_active: {
              type: 'boolean',
              example: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Fund: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            user_id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: 'Monthly Expenses'
            },
            type: {
              type: 'string',
              enum: ['monthly', 'annual', 'savings'],
              example: 'monthly'
            },
            level: {
              type: 'integer',
              enum: [1, 2, 3],
              example: 1
            },
            include_in_budget: {
              type: 'boolean',
              example: true
            },
            display_order: {
              type: 'integer',
              example: 0
            },
            is_active: {
              type: 'boolean',
              example: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            user_id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: 'Groceries'
            },
            fund_id: {
              type: 'string',
              format: 'uuid'
            },
            color_class: {
              type: 'string',
              example: 'bg-green-100 text-green-800 border-green-300'
            },
            is_active: {
              type: 'boolean',
              example: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Income: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            user_id: {
              type: 'string',
              format: 'uuid'
            },
            budget_year_id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: 'Salary'
            },
            amount: {
              type: 'number',
              format: 'decimal',
              example: 5000.00
            },
            source: {
              type: 'string',
              example: 'Company ABC'
            },
            date: {
              type: 'string',
              format: 'date',
              example: '2025-01-15'
            },
            month: {
              type: 'integer',
              example: 1
            },
            year: {
              type: 'integer',
              example: 2025
            },
            note: {
              type: 'string',
              example: 'Monthly salary payment'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Expense: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            user_id: {
              type: 'string',
              format: 'uuid'
            },
            budget_year_id: {
              type: 'string',
              format: 'uuid'
            },
            category_id: {
              type: 'string',
              format: 'uuid'
            },
            fund_id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: 'Grocery shopping'
            },
            amount: {
              type: 'number',
              format: 'decimal',
              example: 150.50
            },
            date: {
              type: 'string',
              format: 'date',
              example: '2025-01-15'
            },
            note: {
              type: 'string',
              example: 'Weekly grocery shopping'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    security: [
      {
        ApiKeyAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js'], // paths to files containing OpenAPI definitions
};

export const specs = swaggerJsdoc(options);
export default specs;