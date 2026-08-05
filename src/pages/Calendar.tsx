import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { useStore } from "../store/useStore";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { upcomingOccurrences } from "../lib/recurrence";
import { formatCurrency, formatDate } from "../lib/format";
import { resolveIcon } from "../lib/icons";

interface DayBill {
  billId: number;
  name: string;
  amount: number;
  color: string;
  icon: string | null | undefined;
}

export function CalendarPage() {
  const bills = useStore((s) => s.bills);
  const categories = useStore((s) => s.categories);
  const markBillPaid = useStore((s) => s.markBillPaid);

  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const occurrencesByDate = useMemo(() => {
    const map = new Map<string, DayBill[]>();
    const rangeEnd = endOfWeek(endOfMonth(month));
    for (const bill of bills) {
      const category = categories.find((c) => c.id === bill.category_id);
      const occurrences = upcomingOccurrences(bill.due_date, bill.recurrence, rangeEnd);
      for (const iso of occurrences) {
        const list = map.get(iso) ?? [];
        list.push({
          billId: bill.id,
          name: bill.name,
          amount: bill.amount,
          color: category?.color ?? "#71717a",
          icon: category?.icon,
        });
        map.set(iso, list);
      }
    }
    return map;
  }, [bills, categories, month]);

  function isoOf(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  const selectedBills = selectedDate ? (occurrencesByDate.get(selectedDate) ?? []) : [];

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Every upcoming bill, projected across the month."
        actions={
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => setMonth((m) => addMonths(m, -1))}>
              <ChevronLeft size={15} />
            </Button>
            <span className="text-sm font-medium w-32 text-center text-[var(--color-ink-1)]">
              {format(month, "MMMM yyyy")}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setMonth((m) => addMonths(m, 1))}>
              <ChevronRight size={15} />
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 p-5">
          <div className="grid grid-cols-7 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center text-[11px] font-medium text-[var(--color-ink-3)] py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const iso = isoOf(day);
              const dayBills = occurrencesByDate.get(iso) ?? [];
              const inMonth = isSameMonth(day, month);
              const selected = selectedDate === iso;
              const total = dayBills.reduce((s, b) => s + b.amount, 0);

              return (
                <motion.button
                  key={iso}
                  onClick={() => setSelectedDate(iso)}
                  whileTap={{ scale: 0.95 }}
                  className={clsx(
                    "relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs transition-colors cursor-pointer",
                    inMonth ? "text-[var(--color-ink-1)]" : "text-[var(--color-ink-3)]/40",
                    selected
                      ? "bg-[var(--color-accent)] text-white"
                      : isToday(day)
                        ? "bg-white/[0.08] border border-[var(--color-accent)]"
                        : "hover:bg-white/[0.05]",
                  )}
                >
                  <span className={clsx("font-medium", isSameDay(day, new Date()) && !selected && "text-[var(--color-accent)]")}>
                    {format(day, "d")}
                  </span>
                  {dayBills.length > 0 && (
                    <span
                      className={clsx(
                        "text-[9px] tabular",
                        selected ? "text-white/80" : "text-[var(--color-ink-3)]",
                      )}
                    >
                      {formatCurrency(total, true)}
                    </span>
                  )}
                  {dayBills.length > 0 && (
                    <div className="flex gap-0.5 absolute bottom-1.5">
                      {dayBills.slice(0, 3).map((b, i) => (
                        <div
                          key={i}
                          className="h-1 w-1 rounded-full"
                          style={{ backgroundColor: selected ? "white" : b.color }}
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-[var(--color-ink-1)] mb-3">
            {selectedDate ? formatDate(selectedDate, { weekday: "long", month: "long", day: "numeric" }) : "Select a day"}
          </h3>
          {selectedDate && selectedBills.length === 0 && (
            <div className="py-10 text-center text-sm text-[var(--color-ink-3)]">Nothing due this day.</div>
          )}
          {selectedBills.map((b, i) => {
            const Icon = resolveIcon(b.icon);
            const bill = bills.find((bill) => bill.id === b.billId);
            return (
              <div
                key={i}
                className="flex items-center gap-3 py-3 border-b border-[var(--color-border-subtle)] last:border-0"
              >
                <div className="shrink-0 rounded-lg p-2" style={{ backgroundColor: `${b.color}1a`, color: b.color }}>
                  <Icon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-[var(--color-ink-1)]">{b.name}</div>
                </div>
                <span className="text-sm font-semibold tabular text-[var(--color-ink-1)]">
                  {formatCurrency(b.amount)}
                </span>
                {bill && bill.due_date === selectedDate && (
                  <Button size="sm" variant="ghost" onClick={() => markBillPaid(bill)}>
                    Mark paid
                  </Button>
                )}
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
