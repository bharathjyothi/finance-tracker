import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import type { Account } from "../../db/types";
import { formatCurrency, formatDate } from "../../lib/format";
import { ACCOUNT_TYPE_LABEL, resolveIcon } from "../../lib/icons";
import { Card } from "../ui/Card";

interface AccountCardProps {
  account: Account;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateBalance: () => void;
  delay?: number;
}

export function AccountCard({ account, onEdit, onDelete, onUpdateBalance, delay = 0 }: AccountCardProps) {
  const Icon = resolveIcon(account.icon);
  const isCredit = account.account_type === "credit_card";
  const utilization =
    isCredit && account.credit_limit ? account.balance / account.credit_limit : null;

  return (
    <Card
      className="p-5 group"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="rounded-xl p-2.5"
            style={{ backgroundColor: `${account.color}1f`, color: account.color }}
          >
            <Icon size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--color-ink-1)]">{account.name}</div>
            <div className="text-xs text-[var(--color-ink-3)]">
              {account.institution} · {ACCOUNT_TYPE_LABEL[account.account_type]}
            </div>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] hover:bg-white/[0.06] cursor-pointer"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-[var(--color-ink-3)] hover:text-[var(--color-negative)] hover:bg-white/[0.06] cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <button
        onClick={onUpdateBalance}
        className="mt-4 block text-left w-full cursor-pointer group/balance"
      >
        <div
          className={`text-2xl font-semibold tabular tracking-tight ${isCredit ? "text-[var(--color-negative)]" : "text-[var(--color-ink-1)]"}`}
        >
          {isCredit ? "−" : ""}
          {formatCurrency(account.balance)}
        </div>
        <div className="text-[11px] text-[var(--color-ink-3)] mt-0.5 group-hover/balance:text-[var(--color-accent)] transition-colors">
          Updated {formatDate(account.updated_at.slice(0, 10))} · click to update
        </div>
      </button>

      {utilization !== null && (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                backgroundColor: utilization > 0.7 ? "var(--color-negative)" : "var(--color-warning)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(utilization * 100, 100)}%` }}
              transition={{ duration: 0.6, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="text-[11px] text-[var(--color-ink-3)] mt-1">
            {Math.round(utilization * 100)}% of {formatCurrency(account.credit_limit ?? 0)} limit
          </div>
        </div>
      )}
    </Card>
  );
}
