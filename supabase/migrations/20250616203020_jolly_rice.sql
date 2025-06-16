/*
  # Family Budget Management System Schema

  1. New Tables
    - `users` - User management
    - `budget_years` - Budget year periods
    - `funds` - Fund definitions (monthly, annual, savings)
    - `fund_budgets` - Budget amounts per fund per year
    - `categories` - Expense categories
    - `incomes` - Income tracking
    - `expenses` - Expense tracking
    - `tithe_given` - Tithe donations
    - `debts` - Debt management
    - `asset_snapshots` - Asset snapshot dates
    - `asset_details` - Asset details per snapshot
    - `system_settings` - User settings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data

  3. Features
    - Helper functions for calculations
    - Views for complex reporting
    - Triggers for automatic updated_at timestamps
    - Demo data for testing
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- טבלת משתמשים
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- טבלת שנות תקציב
CREATE TABLE IF NOT EXISTS budget_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- טבלת קופות
CREATE TABLE IF NOT EXISTS funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('monthly', 'annual', 'savings')),
    level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
    include_in_budget BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, name)
);

-- טבלת תקציבי קופות
CREATE TABLE IF NOT EXISTS fund_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
    budget_year_id UUID NOT NULL REFERENCES budget_years(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount_given DECIMAL(12,2) DEFAULT 0,
    spent DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_amount CHECK (amount >= 0),
    CONSTRAINT positive_amount_given CHECK (amount_given >= 0),
    CONSTRAINT positive_spent CHECK (spent >= 0),
    UNIQUE(fund_id, budget_year_id)
);

-- טבלת קטגוריות
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
    color_class VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, name)
);

-- טבלת הכנסות
CREATE TABLE IF NOT EXISTS incomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    budget_year_id UUID NOT NULL REFERENCES budget_years(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    source VARCHAR(255),
    date DATE NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_income_amount CHECK (amount > 0)
);

-- טבלת הוצאות
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    budget_year_id UUID NOT NULL REFERENCES budget_years(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_expense_amount CHECK (amount > 0)
);

-- טבלת מעשרות
CREATE TABLE IF NOT EXISTS tithe_given (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_tithe_amount CHECK (amount > 0)
);

-- טבלת חובות
CREATE TABLE IF NOT EXISTS debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('owed_to_me', 'i_owe')),
    note TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_debt_amount CHECK (amount > 0)
);

-- עדכון טבלת משימות הקיימת
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'description'
  ) THEN
    ALTER TABLE tasks ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'important'
  ) THEN
    ALTER TABLE tasks ADD COLUMN important BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- טבלת תמונות מצב נכסים
CREATE TABLE IF NOT EXISTS asset_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- טבלת פירוט נכסים
CREATE TABLE IF NOT EXISTS asset_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID NOT NULL REFERENCES asset_snapshots(id) ON DELETE CASCADE,
    asset_type VARCHAR(100) NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('asset', 'liability')),
    
    UNIQUE(snapshot_id, asset_type)
);

-- טבלת הגדרות מערכת
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    data_type VARCHAR(20) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, setting_key)
);

-- יצירת אינדקסים
CREATE INDEX IF NOT EXISTS idx_budget_years_user_id ON budget_years(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_years_dates ON budget_years(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_budget_years_active ON budget_years(user_id, is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_funds_user_id ON funds(user_id);
CREATE INDEX IF NOT EXISTS idx_funds_type ON funds(type);
CREATE INDEX IF NOT EXISTS idx_funds_level ON funds(level);

CREATE INDEX IF NOT EXISTS idx_fund_budgets_fund_id ON fund_budgets(fund_id);
CREATE INDEX IF NOT EXISTS idx_fund_budgets_budget_year_id ON fund_budgets(budget_year_id);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_fund_id ON categories(fund_id);

CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_budget_year_id ON incomes(budget_year_id);
CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(date);
CREATE INDEX IF NOT EXISTS idx_incomes_source ON incomes(source);
CREATE INDEX IF NOT EXISTS idx_incomes_month_year ON incomes(month, year);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_budget_year_id ON expenses(budget_year_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_fund_id ON expenses(fund_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

CREATE INDEX IF NOT EXISTS idx_tithe_given_user_id ON tithe_given(user_id);
CREATE INDEX IF NOT EXISTS idx_tithe_given_date ON tithe_given(date);

CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_type ON debts(type);
CREATE INDEX IF NOT EXISTS idx_debts_is_paid ON debts(is_paid);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_important ON tasks(important);

CREATE INDEX IF NOT EXISTS idx_asset_snapshots_user_id ON asset_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_snapshots_date ON asset_snapshots(date);
CREATE INDEX IF NOT EXISTS idx_asset_details_snapshot_id ON asset_details(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_asset_details_category ON asset_details(category);

CREATE INDEX IF NOT EXISTS idx_system_settings_user_id ON system_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tithe_given ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RLS Policies for budget_years
CREATE POLICY "Users can manage own budget years" ON budget_years FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for funds
CREATE POLICY "Users can manage own funds" ON funds FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for fund_budgets
CREATE POLICY "Users can manage own fund budgets" ON fund_budgets FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM funds WHERE funds.id = fund_budgets.fund_id AND funds.user_id = auth.uid()));

-- RLS Policies for categories
CREATE POLICY "Users can manage own categories" ON categories FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for incomes
CREATE POLICY "Users can manage own incomes" ON incomes FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for expenses
CREATE POLICY "Users can manage own expenses" ON expenses FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for tithe_given
CREATE POLICY "Users can manage own tithe" ON tithe_given FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for debts
CREATE POLICY "Users can manage own debts" ON debts FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for asset_snapshots
CREATE POLICY "Users can manage own asset snapshots" ON asset_snapshots FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for asset_details
CREATE POLICY "Users can manage own asset details" ON asset_details FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM asset_snapshots WHERE asset_snapshots.id = asset_details.snapshot_id AND asset_snapshots.user_id = auth.uid()));

-- RLS Policies for system_settings
CREATE POLICY "Users can manage own settings" ON system_settings FOR ALL TO authenticated USING (auth.uid() = user_id);