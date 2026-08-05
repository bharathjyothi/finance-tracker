import { getDb } from "./index";
import type {
  Account,
  AccountType,
  BalanceHistoryEntry,
  Bill,
  BillPayment,
  Category,
  Expense,
  Recurrence,
} from "./types";

export async function fetchAccounts(): Promise<Account[]> {
  const db = await getDb();
  return db.select<Account[]>(
    "SELECT * FROM accounts WHERE is_archived = 0 ORDER BY display_order ASC, id ASC",
  );
}

export async function createAccount(input: {
  name: string;
  institution: string;
  account_type: AccountType;
  balance: number;
  credit_limit: number | null;
  color: string;
  icon: string | null;
}): Promise<number> {
  const db = await getDb();
  const nextOrder = await db.select<{ n: number }[]>(
    "SELECT COALESCE(MAX(display_order), -1) + 1 as n FROM accounts",
  );
  const result = await db.execute(
    `INSERT INTO accounts (name, institution, account_type, balance, credit_limit, color, icon, display_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      input.name,
      input.institution,
      input.account_type,
      input.balance,
      input.credit_limit,
      input.color,
      input.icon,
      nextOrder[0].n,
    ],
  );
  const id = result.lastInsertId as number;
  await db.execute("INSERT INTO balance_history (account_id, balance) VALUES ($1, $2)", [
    id,
    input.balance,
  ]);
  return id;
}

export async function updateAccount(
  id: number,
  input: Partial<{
    name: string;
    institution: string;
    account_type: AccountType;
    credit_limit: number | null;
    color: string;
    icon: string | null;
  }>,
): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(input);
  if (fields.length === 0) return;
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
  await db.execute(
    `UPDATE accounts SET ${setClause}, updated_at = datetime('now') WHERE id = $1`,
    [id, ...fields.map((f) => (input as Record<string, unknown>)[f])],
  );
}

export async function updateAccountBalance(id: number, balance: number): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE accounts SET balance = $1, updated_at = datetime('now') WHERE id = $2",
    [balance, id],
  );
  await db.execute("INSERT INTO balance_history (account_id, balance) VALUES ($1, $2)", [
    id,
    balance,
  ]);
}

export async function archiveAccount(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE accounts SET is_archived = 1 WHERE id = $1", [id]);
}

export async function fetchBalanceHistory(accountId?: number): Promise<BalanceHistoryEntry[]> {
  const db = await getDb();
  if (accountId != null) {
    return db.select<BalanceHistoryEntry[]>(
      "SELECT * FROM balance_history WHERE account_id = $1 ORDER BY recorded_at ASC",
      [accountId],
    );
  }
  return db.select<BalanceHistoryEntry[]>("SELECT * FROM balance_history ORDER BY recorded_at ASC");
}

export async function fetchCategories(): Promise<Category[]> {
  const db = await getDb();
  return db.select<Category[]>("SELECT * FROM categories ORDER BY name ASC");
}

export async function createCategory(input: {
  name: string;
  color: string;
  icon: string | null;
}): Promise<number> {
  const db = await getDb();
  const result = await db.execute(
    "INSERT INTO categories (name, color, icon) VALUES ($1, $2, $3)",
    [input.name, input.color, input.icon],
  );
  return result.lastInsertId as number;
}

export async function fetchBills(): Promise<Bill[]> {
  const db = await getDb();
  return db.select<Bill[]>("SELECT * FROM bills WHERE is_active = 1 ORDER BY due_date ASC");
}

export async function createBill(input: {
  name: string;
  category_id: number | null;
  amount: number;
  due_date: string;
  recurrence: Recurrence;
  account_id: number | null;
  autopay: boolean;
  notify_days_before: number;
  notes: string | null;
}): Promise<number> {
  const db = await getDb();
  const result = await db.execute(
    `INSERT INTO bills (name, category_id, amount, due_date, recurrence, account_id, autopay, notify_days_before, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      input.name,
      input.category_id,
      input.amount,
      input.due_date,
      input.recurrence,
      input.account_id,
      input.autopay ? 1 : 0,
      input.notify_days_before,
      input.notes,
    ],
  );
  return result.lastInsertId as number;
}

export async function updateBill(
  id: number,
  input: Partial<{
    name: string;
    category_id: number | null;
    amount: number;
    due_date: string;
    recurrence: Recurrence;
    account_id: number | null;
    autopay: boolean;
    notify_days_before: number;
    notes: string | null;
    is_active: boolean;
  }>,
): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(input);
  if (fields.length === 0) return;
  const values = fields.map((f) => {
    const v = (input as Record<string, unknown>)[f];
    if (typeof v === "boolean") return v ? 1 : 0;
    return v;
  });
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
  await db.execute(`UPDATE bills SET ${setClause} WHERE id = $1`, [id, ...values]);
}

export async function deleteBill(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM bills WHERE id = $1", [id]);
}

export async function fetchBillPayments(): Promise<BillPayment[]> {
  const db = await getDb();
  return db.select<BillPayment[]>("SELECT * FROM bill_payments ORDER BY due_date DESC");
}

export async function recordBillPayment(bill: Bill): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO bill_payments (bill_id, due_date, paid_date, amount, status)
     VALUES ($1, $2, datetime('now'), $3, 'paid')
     ON CONFLICT(bill_id, due_date) DO UPDATE SET paid_date = datetime('now'), status = 'paid'`,
    [bill.id, bill.due_date, bill.amount],
  );
}

export async function fetchExpenses(limit?: number): Promise<Expense[]> {
  const db = await getDb();
  if (limit != null) {
    return db.select<Expense[]>("SELECT * FROM expenses ORDER BY date DESC LIMIT $1", [limit]);
  }
  return db.select<Expense[]>("SELECT * FROM expenses ORDER BY date DESC");
}

export async function createExpense(input: {
  description: string;
  amount: number;
  category_id: number | null;
  account_id: number | null;
  date: string;
  source?: "manual" | "csv_import";
}): Promise<number> {
  const db = await getDb();
  const result = await db.execute(
    `INSERT INTO expenses (description, amount, category_id, account_id, date, source)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      input.description,
      input.amount,
      input.category_id,
      input.account_id,
      input.date,
      input.source ?? "manual",
    ],
  );
  return result.lastInsertId as number;
}

export async function createExpensesBulk(
  inputs: {
    description: string;
    amount: number;
    category_id: number | null;
    account_id: number | null;
    date: string;
  }[],
): Promise<void> {
  const db = await getDb();
  for (const input of inputs) {
    await db.execute(
      `INSERT INTO expenses (description, amount, category_id, account_id, date, source)
       VALUES ($1, $2, $3, $4, $5, 'csv_import')`,
      [input.description, input.amount, input.category_id, input.account_id, input.date],
    );
  }
}

export async function deleteExpense(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM expenses WHERE id = $1", [id]);
}

export async function fetchNotifiedBillKeys(): Promise<Set<string>> {
  const db = await getDb();
  const rows = await db.select<{ bill_id: number; due_date: string }[]>(
    "SELECT bill_id, due_date FROM notified_bills",
  );
  return new Set(rows.map((r) => `${r.bill_id}:${r.due_date}`));
}

export async function markBillNotified(billId: number, dueDate: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT OR IGNORE INTO notified_bills (bill_id, due_date) VALUES ($1, $2)",
    [billId, dueDate],
  );
}
