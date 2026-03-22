"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from "recharts";
import { formatTooltipNumber } from "./dashboardFormat";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  data: { date: string; value: number }[];
  color?: string;
  error?: string | null;
}

export function MetricCard({
  title,
  value,
  subtitle,
  data,
  color = "var(--color-primary)",
  error,
}: MetricCardProps) {
  if (error) {
    return (
      <div className="bg-card-light rounded-lg border border-card-border p-5">
        <p className="text-xs font-medium text-subtext mb-1">{title}</p>
        <p className="text-xs text-secondary">로드 실패</p>
      </div>
    );
  }

  return (
    <div className="bg-card-light rounded-lg border border-card-border p-5">
      <p className="text-xs font-medium text-subtext mb-1">{title}</p>
      <p className="text-2xl font-bold text-text-main">{value}</p>
      {subtitle && <p className="text-[10px] text-subtext mt-0.5">{subtitle}</p>}
      {data.length > 1 && (
        <div className="h-12 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid var(--color-card-border)",
                }}
                labelFormatter={(l) => String(l)}
                formatter={(v) => [formatTooltipNumber(v), ""]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
