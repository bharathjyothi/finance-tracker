import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { NetWorthPoint } from "../../lib/derived";
import { formatCurrency, formatMonthDay } from "../../lib/format";
import { ChartTooltip } from "./ChartTooltip";

const ACCENT = "#3987e5";

export function NetWorthChart({ data }: { data: NetWorthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.22} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border-subtle)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatMonthDay(v)}
          tick={{ fill: "var(--color-ink-3)", fontSize: 11 }}
          axisLine={{ stroke: "var(--color-border-subtle)" }}
          tickLine={false}
          minTickGap={40}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v, true)}
          tick={{ fill: "var(--color-ink-3)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <ChartTooltip
                title={formatMonthDay(label as string)}
                rows={[{ label: "Net worth", value: formatCurrency(payload[0].value as number), color: ACCENT }]}
              />
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={ACCENT}
          strokeWidth={2}
          fill="url(#netWorthFill)"
          dot={false}
          activeDot={{ r: 4, fill: ACCENT, stroke: "var(--color-surface-2)", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
