CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    institution TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'brokerage', 'credit_card')),
    balance REAL NOT NULL DEFAULT 0,
    credit_limit REAL,
    color TEXT NOT NULL DEFAULT '#6366f1',
    icon TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE balance_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    balance REAL NOT NULL,
    recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_balance_history_account ON balance_history(account_id, recorded_at);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL,
    icon TEXT
);

CREATE TABLE bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    amount REAL NOT NULL,
    due_date TEXT NOT NULL,
    recurrence TEXT NOT NULL DEFAULT 'monthly' CHECK (recurrence IN ('once', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    account_id INTEGER REFERENCES accounts(id),
    autopay INTEGER NOT NULL DEFAULT 0,
    notify_days_before INTEGER NOT NULL DEFAULT 3,
    is_active INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE bill_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    due_date TEXT NOT NULL,
    paid_date TEXT,
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'skipped')),
    UNIQUE(bill_id, due_date)
);
CREATE INDEX idx_bill_payments_due ON bill_payments(due_date, status);

CREATE TABLE expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    account_id INTEGER REFERENCES accounts(id),
    date TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'csv_import')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category_id);

CREATE TABLE notified_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    due_date TEXT NOT NULL,
    notified_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(bill_id, due_date)
);

INSERT INTO categories (name, color, icon) VALUES
    ('Housing', '#f97316', 'home'),
    ('Utilities', '#eab308', 'zap'),
    ('Insurance', '#06b6d4', 'shield'),
    ('Transportation', '#8b5cf6', 'car'),
    ('Groceries', '#22c55e', 'shopping-cart'),
    ('Dining', '#ec4899', 'utensils'),
    ('Lawn & Home Care', '#65a30d', 'trees'),
    ('Subscriptions', '#6366f1', 'repeat'),
    ('Entertainment', '#d946ef', 'clapperboard'),
    ('Healthcare', '#ef4444', 'heart-pulse'),
    ('Other', '#71717a', 'more-horizontal');

INSERT INTO accounts (name, institution, account_type, balance, color, icon, display_order) VALUES
    ('Chase Checking', 'Chase', 'checking', 0, '#0f4fa8', 'landmark', 0),
    ('Wealthfront HYSA', 'Wealthfront', 'savings', 0, '#00c774', 'piggy-bank', 1),
    ('Fidelity', 'Fidelity', 'brokerage', 0, '#4c9a2a', 'trending-up', 2),
    ('Robinhood', 'Robinhood', 'brokerage', 0, '#00c805', 'trending-up', 3),
    ('Capital One', 'Capital One', 'credit_card', 0, '#d03027', 'credit-card', 4),
    ('Bank of America', 'BofA', 'credit_card', 0, '#e31837', 'credit-card', 5),
    ('Discover', 'Discover', 'credit_card', 0, '#ff6000', 'credit-card', 6);
