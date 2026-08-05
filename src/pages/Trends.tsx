import { useEffect, useMemo, useState } from "react";
import { subDays } from "date-fns";
import { useStore } from "../store/useStore";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { fetchBalanceHistory } from "../db/queries";
import type { BalanceHistoryEntry } from "../db/types";
import { categoryBreakdown, monthlySpending, netWorthSeries } from "../lib/derived";
import { NetWorthChart } from "../components/charts/NetWorthChart";
import { CategoryBreakdownChart } from "../components/charts/CategoryBreakdownChart";
import { MonthlySpendingChart } from "../components/charts/MonthlySpendingChart";
import { formatCurrency } from "../lib/format";

const RANGE_OPTIONS = [
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "365 days", days: 365 },
];

export function Trends() {
  const accounts = useStore((s) => s.accounts);
  const expenses = useStore((s) => s.expenses);
  const categories = useStore((s) => s.categories);

  const [balanceHistory, setBalanceHistory] = useState<BalanceHistoryEntry[]>([]);
  const [rangeDays, setRangeDays] = useState(90);

  useEffect(() => {
    void fetchBalanceHistory().then(setBalanceHistory);
  }, [accounts.length]);

  const netWorthData = useMemo(() => netWorthSeries(accounts, balanceHistory), [accounts, balanceHistory]);
  const sinceIso = useMemo(
    () => subDays(new Date(), rangeDays).toISOString().slice(0, 10),
    [rangeDays],
  );
  const categoryData = useMemo(
    () => categoryBreakdown(expenses, categories, sinceIso),
    [expenses, categories, sinceIso],
  );
  const monthlyData = useMemo(() => monthlySpending(expenses, 6), [expenses]);

  const totalInRange = categoryData.reduce((s, c) => s + c.value, 0);
  const topCategory = categoryData[0];
  const avgMonthly = monthlyData.length
    ? monthlyData.reduce((s, m) => s + m.value, 0) / monthlyData.length
    : 0;

  return (
    <div>
      <PageHeader title="Trends" subtitle="Where your money goes, over time." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="text-xs text-[var(--color-ink-3)] mb-1">Spent in range</div>
          <div className="text-xl font-semibold tabular text-[var(--color-ink-1)]">
            {formatCurrency(totalInRange)}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-[var(--color-ink-3)] mb-1">Top category</div>
          <div className="text-xl font-semibold text-[var(--color-ink-1)]">
            {topCategory ? topCategory.name : "—"}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-[var(--color-ink-3)] mb-1">Avg monthly spend (6mo)</div>
          <div className="text-xl font-semibold tabular text-[var(--color-ink-1)]">
            {formatCurrency(avgMonthly)}
          </div>
        </Card>
      </div>

      <Card className="p-5 mb-6">
        <h3 className="text-sm font-semibold text-[var(--color-ink-1)] mb-3">Net Worth Over Time</h3>
        <NetWorthChart data={netWorthData} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--color-ink-1)]">Spending by Category</h3>
            <div className="flex gap-1 rounded-lg bg-white/[0.04] p-0.5">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  onClick={() => setRangeDays(opt.days)}
                  className={`text-[11px] px-2 py-1 rounded-md cursor-pointer transition-colors ${
                    rangeDays === opt.days
                      ? "bg-white/[0.1] text-[var(--color-ink-1)]"
                      : "text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {categoryData.length === 0 ? (
            <div className="py-16 text-center text-sm text-[var(--color-ink-3)]">
              No expenses in this range yet.
            </div>
          ) : (
            <CategoryBreakdownChart data={categoryData} />
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[var(--color-ink-1)] mb-3">Monthly Spending</h3>
          <MonthlySpendingChart data={monthlyData} />
        </Card>
      </div>
    </div>
  );
}
