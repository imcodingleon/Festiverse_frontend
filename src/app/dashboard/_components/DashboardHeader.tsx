"use client";

interface DashboardHeaderProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
}

export function DashboardHeader({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-text-main">Festiverse Dashboard</h1>
        <p className="text-sm text-subtext mt-1">퍼널 분석 대시보드</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="px-3 py-2 text-sm border border-card-border rounded-lg bg-card-light text-text-main"
        />
        <span className="text-subtext text-sm">~</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="px-3 py-2 text-sm border border-card-border rounded-lg bg-card-light text-text-main"
        />
      </div>
    </div>
  );
}
