export type AccountType = "checking" | "savings" | "brokerage" | "credit_card";

export interface Account {
  id: number;
  name: string;
  institution: string;
  account_type: AccountType;
  balance: number;
  credit_limit: number | null;
  color: string;
  icon: string | null;
  display_order: number;
  is_archived: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string | null;
}

export type Recurrence = "once" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";

export interface Bill {
  id: number;
  name: string;
  category_id: number | null;
  amount: number;
  due_date: string;
  recurrence: Recurrence;
  account_id: number | null;
  autopay: number;
  notify_days_before: number;
  is_active: number;
  notes: string | null;
  created_at: string;
}

export type BillPaymentStatus = "pending" | "paid" | "skipped";

export interface BillPayment {
  id: number;
  bill_id: number;
  due_date: string;
  paid_date: string | null;
  amount: number;
  status: BillPaymentStatus;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category_id: number | null;
  account_id: number | null;
  date: string;
  source: "manual" | "csv_import";
  created_at: string;
}

export interface BalanceHistoryEntry {
  id: number;
  account_id: number;
  balance: number;
  recorded_at: string;
}
