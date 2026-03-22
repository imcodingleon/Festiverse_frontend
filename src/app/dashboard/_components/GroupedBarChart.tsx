"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatTooltipNumber } from "./dashboardFormat";

interface GroupedBarChartProps {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  xKey: string;
  bars: { dataKey: string; name: string; color: string }[];
  yFormatter?: (v: number) => string;
  height?: number;
}

export function GroupedBarChart({
  title,
  data,
  xKey,
  bars,
  yFormatter,
  height = 280,
}: GroupedBarChartProps) {
  return (
    <div className="bg-card-light rounded-lg border border-card-border p-5">
      <p className="text-sm font-bold text-text-main mb-4">{title}</p>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 10, fill: "var(--color-subtext)" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--color-subtext)" }}
              tickFormatter={yFormatter}
              width={50}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid var(--color-card-border)",
              }}
              formatter={(v, name) => {
                const n = Number(v);
                const label = yFormatter
                  ? yFormatter(Number.isFinite(n) ? n : NaN)
                  : formatTooltipNumber(v);
                return [label, String(name)];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                name={bar.name}
                fill={bar.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
