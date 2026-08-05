import type { Account, BalanceHistoryEntry, Category, Expense } from "../db/types";

/** Validated dark-mode categorical palette (fixed order — see dataviz skill palette.md). */
export const CHART_CATEGORICAL = [
  "#3987e5", // blue
  "#d95926", // orange
  "#199e70", // aqua
  "#c98500", // yellow
  "#d55181", // magenta
  "#008300", // green
  "#9085e9", // violet
  "#e66767", // red
] as const;

export function totalAssets(accounts: Account[]): number {
  return accounts
    .filter((a) => a.account_type !== "credit_card")
    .reduce((sum, a) => sum + a.balance, 0);
}

export function totalDebt(accounts: Account[]): number {
  return accounts
    .filter((a) => a.account_type === "credit_card")
    .reduce((sum, a) => sum + a.balance, 0);
}

export function netWorth(accounts: Account[]): number {
  return totalAssets(accounts) - totalDebt(accounts);
}

export function creditUtilization(accounts: Account[]): number | null {
  const cards = accounts.filter((a) => a.account_type === "credit_card" && a.credit_limit);
  if (cards.length === 0) return null;
  const balance = cards.reduce((sum, a) => sum + a.balance, 0);
  const limit = cards.reduce((sum, a) => sum + (a.credit_limit ?? 0), 0);
  if (limit === 0) return null;
  return balance / limit;
}

export interface NetWorthPoint {
  date: string;
  value: number;
}

/** Forward-fills each account's latest known balance at every snapshot date to build a net worth series. */
export function netWorthSeries(accounts: Account[], history: BalanceHistoryEntry[]): NetWorthPoint[] {
  if (history.length === 0) {
    return [{ date: new Date().toISOString().slice(0, 10), value: netWorth(accounts) }];
  }
  const isDebt = new Map(accounts.map((a) => [a.id, a.account_type === "credit_card"]));
  const dates = Array.from(new Set(history.map((h) => h.recorded_at.slice(0, 10)))).sort();
  const latestByAccount = new Map<number, number>();
  const sorted = [...history].sort((a, b) => (a.recorded_at < b.recorded_at ? -1 : 1));

  return dates.map((date) => {
    for (const entry of sorted) {
      if (entry.recorded_at.slice(0, 10) <= date) {
        latestByAccount.set(entry.account_id, entry.balance);
      }
    }
    let value = 0;
    for (const [accountId, balance] of latestByAccount) {
      value += isDebt.get(accountId) ? -balance : balance;
    }
    return { date, value };
  });
}

export interface CategorySlice {
  name: string;
  value: number;
  color: string;
}

/** Top 7 categories by spend + an "Other" bucket, in the fixed validated categorical order. */
export function categoryBreakdown(
  expenses: Expense[],
  categories: Category[],
  sinceIso?: string,
): CategorySlice[] {
  const filtered = sinceIso ? expenses.filter((e) => e.date >= sinceIso) : expenses;
  const totals = new Map<string, number>();
  for (const expense of filtered) {
    const name = categories.find((c) => c.id === expense.category_id)?.name ?? "Uncategorized";
    totals.set(name, (totals.get(name) ?? 0) + expense.amount);
  }
  const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 7);
  const rest = sorted.slice(7).reduce((sum, [, v]) => sum + v, 0);
  const slices: CategorySlice[] = top.map(([name, value], i) => ({
    name,
    value,
    color: CHART_CATEGORICAL[i],
  }));
  if (rest > 0) slices.push({ name: "Other", value: rest, color: CHART_CATEGORICAL[7] });
  return slices;
}

export interface MonthPoint {
  month: string;
  value: number;
}

export function monthlySpending(expenses: Expense[], monthsBack = 6): MonthPoint[] {
  const now = new Date();
  const buckets: MonthPoint[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({ month: key, value: 0 });
  }
  const byKey = new Map(buckets.map((b) => [b.month, b]));
  for (const expense of expenses) {
    const key = expense.date.slice(0, 7);
    const bucket = byKey.get(key);
    if (bucket) bucket.value += expense.amount;
  }
  return buckets;
}
