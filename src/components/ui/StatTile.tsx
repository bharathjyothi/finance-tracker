import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";
import { clsx } from "clsx";

interface StatTileProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "accent" | "positive" | "negative" | "neutral";
  delay?: number;
  sub?: string;
}

const toneClasses = {
  accent: "text-[var(--color-accent)] bg-[var(--color-accent-soft)]",
  positive: "text-[var(--color-positive)] bg-[var(--color-positive-soft)]",
  negative: "text-[var(--color-negative)] bg-[var(--color-negative-soft)]",
  neutral: "text-[var(--color-ink-2)] bg-white/[0.06]",
};

export function StatTile({ label, value, icon: Icon, tone = "neutral", delay = 0, sub }: StatTileProps) {
  return (
    <Card
      className="p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-[var(--color-ink-3)]">{label}</span>
        <div className={clsx("rounded-lg p-1.5", toneClasses[tone])}>
          <Icon size={14} />
        </div>
      </div>
      <motion.div
        className="mt-3 text-2xl font-semibold tabular tracking-tight text-[var(--color-ink-1)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.1 }}
      >
        {value}
      </motion.div>
      {sub && <div className="mt-1 text-xs text-[var(--color-ink-3)]">{sub}</div>}
    </Card>
  );
}
