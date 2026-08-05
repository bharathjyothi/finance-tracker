interface TooltipRow {
  label: string;
  value: string;
  color?: string;
}

export function ChartTooltip({ title, rows }: { title: string; rows: TooltipRow[] }) {
  return (
    <div className="glass-panel bg-[var(--color-surface-2)] rounded-lg px-3 py-2 shadow-xl text-xs">
      <div className="text-[var(--color-ink-2)] font-medium mb-1">{title}</div>
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          {row.color && <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: row.color }} />}
          <span className="text-[var(--color-ink-3)]">{row.label}</span>
          <span className="text-[var(--color-ink-1)] font-medium tabular ml-auto">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
