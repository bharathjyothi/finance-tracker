import { clsx } from "clsx";
import type { ReactNode } from "react";

type Tone = "positive" | "negative" | "warning" | "accent" | "neutral";

const toneClasses: Record<Tone, string> = {
  positive: "bg-[var(--color-positive-soft)] text-[var(--color-positive)]",
  negative: "bg-[var(--color-negative-soft)] text-[var(--color-negative)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  neutral: "bg-white/[0.07] text-[var(--color-ink-2)]",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}
