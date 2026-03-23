"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatTooltipNumber } from "./dashboardFormat";

interface TrendLineChartProps {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  lines: { dataKey: string; name: string; color: string }[];
  yFormatter?: (v: number) => string;
  height?: number;
}

export function TrendLineChart({
  title,
  data,
  lines,
  yFormatter,
  height = 260,
}: TrendLineChartProps) {
  return (
    <div className="bg-card-light rounded-lg border border-card-border p-5">
      <p className="text-sm font-bold text-text-main mb-4">{title}</p>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--color-subtext)" }}
              tickFormatter={(v: string) => v.slice(5)}
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
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
