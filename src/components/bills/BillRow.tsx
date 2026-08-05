import { motion } from "framer-motion";
import { Check, Repeat } from "lucide-react";
import type { Bill, Category } from "../../db/types";
import { formatCurrency, formatDate } from "../../lib/format";
import { daysUntil } from "../../lib/recurrence";
import { resolveIcon } from "../../lib/icons";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface BillRowProps {
  bill: Bill;
  category?: Category;
  onMarkPaid: (bill: Bill) => void;
  delay?: number;
}

export function BillRow({ bill, category, onMarkPaid, delay = 0 }: BillRowProps) {
  const days = daysUntil(bill.due_date);
  const Icon = resolveIcon(category?.icon);

  const tone = days < 0 ? "negative" : days <= 3 ? "warning" : "neutral";
  const label = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today" : `in ${days}d`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-3 py-3 border-b border-[var(--color-border-subtle)] last:border-0"
    >
      <div
        className="shrink-0 rounded-lg p-2"
        style={{ backgroundColor: `${category?.color ?? "#71717a"}1a`, color: category?.color ?? "#71717a" }}
      >
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-[var(--color-ink-1)] truncate">{bill.name}</span>
          {bill.recurrence !== "once" && <Repeat size={11} className="text-[var(--color-ink-3)] shrink-0" />}
        </div>
        <div className="text-xs text-[var(--color-ink-3)] mt-0.5">{formatDate(bill.due_date)}</div>
      </div>
      <Badge tone={tone}>{label}</Badge>
      <span className="text-sm font-semibold tabular text-[var(--color-ink-1)] w-20 text-right">
        {formatCurrency(bill.amount)}
      </span>
      <Button size="sm" variant="ghost" onClick={() => onMarkPaid(bill)} title="Mark as paid">
        <Check size={14} />
      </Button>
    </motion.div>
  );
}
