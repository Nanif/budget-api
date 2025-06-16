# Family Budget Management API

A comprehensive Node.js REST API for managing family budget with Supabase database integration.

## Features

- ✅ Complete family budget management system
- ✅ User authentication and authorization
- ✅ Budget years management
- ✅ Funds and fund budgets tracking
- ✅ Categories management
- ✅ Income and expense tracking
- ✅ Tithe management
- ✅ Debt tracking
- ✅ Task management
- ✅ Asset snapshots
- ✅ System settings
- ✅ Supabase database integration with RLS
- ✅ RESTful API design
- ✅ Error handling and logging
- ✅ Modern ES modules syntax

## Database Schema

### Core Tables
- **users** - User management
- **budget_years** - Budget year periods (e.g., "01/24 - 12/24")
- **funds** - Fund definitions (monthly, annual, savings)
- **fund_budgets** - Budget amounts per fund per year
- **categories** - Expense categories linked to funds
- **incomes** - Income tracking with source and budget year
- **expenses** - Expense tracking with categories and funds
- **tithe_given** - Tithe donations tracking
- **debts** - Debt management (owed to me / I owe)
- **tasks** - Task management with importance flags
- **asset_snapshots** - Asset snapshot dates
- **asset_details** - Detailed asset information per snapshot
- **system_settings** - User-specific system settings

## API Endpoints

### Budget Years Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budget-years` | Get all budget years |
| GET | `/api/budget-years/active` | Get active budget year |
| GET | `/api/budget-years/:id` | Get specific budget year |
| POST | `/api/budget-years` | Create new budget year |
| PUT | `/api/budget-years/:id` | Update budget year |
| PUT | `/api/budget-years/:id/activate` | Activate budget year |
| DELETE | `/api/budget-years/:id` | Delete budget year |

### Funds Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/funds` | Get all funds (with optional budget year filter) |
| GET | `/api/funds/:id` | Get specific fund |
| POST | `/api/funds` | Create new fund |
| PUT | `/api/funds/:id` | Update fund |
| PUT | `/api/funds/:id/budget/:budgetYearId` | Update fund budget for specific year |
| PUT | `/api/funds/:id/deactivate` | Deactivate fund |
| PUT | `/api/funds/:id/activate` | Activate fund |
| DELETE | `/api/funds/:id` | Delete fund |

### Categories Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/fund/:fundId` | Get categories by fund |
| GET | `/api/categories/:id` | Get specific category |
| POST | `/api/categories` | Create new category |
| PUT | `/api/categories/:id` | Update category |
| PUT | `/api/categories/:id/deactivate` | Deactivate category |
| PUT | `/api/categories/:id/activate` | Activate category |
| DELETE | `/api/categories/:id` | Delete category |

### Tasks Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get specific task |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/toggle` | Toggle task completion |

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Add your Supabase credentials to `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. The database migration will create all tables automatically when you connect to Supabase.

4. Start the server:
   ```bash
   npm run dev
   ```

## Request Examples

### Create a Budget Year
```bash
curl -X POST http://localhost:3000/api/budget-years \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user-id" \
  -d '{
    "name": "01/25 - 12/25",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "is_active": true
  }'
```

### Create a Fund
```bash
curl -X POST http://localhost:3000/api/funds \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user-id" \
  -d '{
    "name": "Monthly Expenses",
    "type": "monthly",
    "level": 1,
    "include_in_budget": true
  }'
```

### Create a Category
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user-id" \
  -d '{
    "name": "Groceries",
    "fund_id": "fund-uuid-here",
    "color_class": "bg-green-100 text-green-800 border-green-300"
  }'
```

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Authenticated access required for all operations
- Foreign key constraints maintain data integrity

## Project Structure

```
src/
├── index.js              # Main server file
├── config/
│   ├── index.js          # App configuration
│   └── supabase.js       # Supabase client setup
├── middleware/
│   └── auth.js           # Authentication middleware
├── services/
│   ├── budgetYearService.js  # Budget year operations
│   ├── fundService.js        # Fund operations
│   ├── categoryService.js    # Category operations
│   └── taskService.js        # Task operations
├── routes/
│   ├── budgetYears.js    # Budget year routes
│   ├── funds.js          # Fund routes
│   ├── categories.js     # Category routes
│   └── taskRoutes.js     # Task routes
└── utils/
    └── logger.js         # Logging utility

supabase/
└── migrations/
    └── create_family_budget_schema.sql  # Complete database schema
```

Ready to manage your family budget! 💰