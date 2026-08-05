import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { subDays } from "date-fns";
import { CreditCard, PiggyBank, Receipt, Wallet } from "lucide-react";
import { useStore } from "../store/useStore";
import { PageHeader } from "../components/ui/PageHeader";
import { StatTile } from "../components/ui/StatTile";
import { Card } from "../components/ui/Card";
import { BillRow } from "../components/bills/BillRow";
import { NetWorthChart } from "../components/charts/NetWorthChart";
import { CategoryBreakdownChart } from "../components/charts/CategoryBreakdownChart";
import { formatCurrency } from "../lib/format";
import { totalAssets, totalDebt, netWorth, netWorthSeries, categoryBreakdown } from "../lib/derived";
import { daysUntil } from "../lib/recurrence";
import { resolveIcon } from "../lib/icons";
import { fetchBalanceHistory } from "../db/queries";
import type { BalanceHistoryEntry } from "../db/types";

export function Dashboard() {
  const accounts = useStore((s) => s.accounts);
  const bills = useStore((s) => s.bills);
  const categories = useStore((s) => s.categories);
  const expenses = useStore((s) => s.expenses);
  const markBillPaid = useStore((s) => s.markBillPaid);

  const [busyBillId, setBusyBillId] = useState<number | null>(null);
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistoryEntry[]>([]);

  useEffect(() => {
    void fetchBalanceHistory().then(setBalanceHistory);
  }, [accounts.length]);

  const assets = totalAssets(accounts);
  const debt = totalDebt(accounts);
  const worth = netWorth(accounts);

  const netWorthData = useMemo(() => netWorthSeries(accounts, balanceHistory), [accounts, balanceHistory]);
  const categoryData = useMemo(
    () => categoryBreakdown(expenses, categories, subDays(new Date(), 30).toISOString().slice(0, 10)),
    [expenses, categories],
  );

  const upcomingBills = useMemo(
    () =>
      [...bills].filter((b) => daysUntil(b.due_date) <= 14).sort((a, b) => (a.due_date < b.due_date ? -1 : 1)),
    [bills],
  );

  const dueThisWeekTotal = useMemo(
    () => bills.filter((b) => daysUntil(b.due_date) <= 7 && daysUntil(b.due_date) >= 0).reduce((s, b) => s + b.amount, 0),
    [bills],
  );

  const recentExpenses = expenses.slice(0, 6);

  async function handleMarkPaid(bill: (typeof bills)[number]) {
    setBusyBillId(bill.id);
    await markBillPaid(bill);
    setBusyBillId(null);
  }

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your full financial picture, at a glance." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="Net Worth" value={formatCurrency(worth)} icon={Wallet} tone="accent" delay={0} />
        <StatTile label="Total Assets" value={formatCurrency(assets)} icon={PiggyBank} tone="positive" delay={0.05} />
        <StatTile label="Total Debt" value={formatCurrency(debt)} icon={CreditCard} tone="negative" delay={0.1} />
        <StatTile
          label="Due This Week"
          value={formatCurrency(dueThisWeekTotal)}
          icon={Receipt}
          tone="neutral"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <Card className="lg:col-span-3 p-5">
          <h3 className="text-sm font-semibold text-[var(--color-ink-1)] mb-3">Net Worth Over Time</h3>
          <NetWorthChart data={netWorthData} />
        </Card>

        <Card className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-[var(--color-ink-1)] mb-3">Spending by Category</h3>
          {categoryData.length === 0 ? (
            <div className="py-16 text-center text-sm text-[var(--color-ink-3)]">
              No expenses in the last 30 days.
            </div>
          ) : (
            <CategoryBreakdownChart data={categoryData} />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-[var(--color-ink-1)]">Upcoming Bills</h3>
            <Link to="/calendar" className="text-xs text-[var(--color-accent)] hover:underline">
              View calendar
            </Link>
          </div>
          {upcomingBills.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-ink-3)]">
              Nothing due in the next two weeks.
            </div>
          ) : (
            <div>
              <AnimatePresence initial={false}>
                {upcomingBills.map((bill, i) => (
                  <div key={bill.id} className={busyBillId === bill.id ? "opacity-40" : ""}>
                    <BillRow
                      bill={bill}
                      category={categories.find((c) => c.id === bill.category_id)}
                      onMarkPaid={handleMarkPaid}
                      delay={i * 0.03}
                    />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-[var(--color-ink-1)]">Recent Expenses</h3>
            <Link to="/expenses" className="text-xs text-[var(--color-accent)] hover:underline">
              View all
            </Link>
          </div>
          {recentExpenses.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-ink-3)]">No expenses logged yet.</div>
          ) : (
            <div>
              {recentExpenses.map((expense) => {
                const category = categories.find((c) => c.id === expense.category_id);
                const Icon = resolveIcon(category?.icon);
                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-3 py-2.5 border-b border-[var(--color-border-subtle)] last:border-0"
                  >
                    <div
                      className="shrink-0 rounded-lg p-1.5"
                      style={{ backgroundColor: `${category?.color ?? "#71717a"}1a`, color: category?.color ?? "#71717a" }}
                    >
                      <Icon size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-[var(--color-ink-1)] truncate">{expense.description}</div>
                      <div className="text-[11px] text-[var(--color-ink-3)]">{expense.date}</div>
                    </div>
                    <span className="text-sm font-medium tabular text-[var(--color-ink-1)]">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
