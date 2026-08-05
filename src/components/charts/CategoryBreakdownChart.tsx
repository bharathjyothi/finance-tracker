import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CategorySlice } from "../../lib/derived";
import { formatCurrency } from "../../lib/format";
import { ChartTooltip } from "./ChartTooltip";

export function CategoryBreakdownChart({ data }: { data: CategorySlice[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barCategoryGap={10}>
        <CartesianGrid stroke="var(--color-border-subtle)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => formatCurrency(v, true)}
          tick={{ fill: "var(--color-ink-3)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "var(--color-ink-2)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0].payload as CategorySlice;
            return (
              <ChartTooltip
                title={item.name}
                rows={[{ label: "Spent", value: formatCurrency(item.value), color: item.color }]}
              />
            );
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
