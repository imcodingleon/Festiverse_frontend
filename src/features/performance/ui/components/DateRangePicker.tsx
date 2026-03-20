"use client";

import { useState } from "react";
import { Icon } from "@/ui/components/Icon";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

  const displayText =
    startDate && endDate
      ? `${startDate} - ${endDate}`
      : "날짜를 선택하세요";

  const handleApply = () => {
    onChange(localStart, localEnd);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalStart("");
    setLocalEnd("");
    onChange("", "");
    setOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-3 bg-card-light rounded-lg border border-card-border shadow-sm text-left"
      >
        <Icon name="calendar_month" className="text-secondary text-sm" />
        <span className="text-sm font-medium text-text-main">{displayText}</span>
        <Icon name="expand_more" className="text-subtext/50 text-sm ml-auto" />
      </button>
      {open && (
        <div className="mt-2 p-4 bg-card-light rounded-lg border border-card-border shadow-sm space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-subtext font-bold uppercase">시작일</label>
              <input
                type="date"
                value={localStart ? localStart.replace(/\./g, "-") : ""}
                onChange={(e) => setLocalStart(e.target.value.replace(/-/g, "."))}
                className="w-full mt-1 p-2 border border-card-border rounded-lg text-sm text-text-main"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-subtext font-bold uppercase">종료일</label>
              <input
                type="date"
                value={localEnd ? localEnd.replace(/\./g, "-") : ""}
                onChange={(e) => setLocalEnd(e.target.value.replace(/-/g, "."))}
                className="w-full mt-1 p-2 border border-card-border rounded-lg text-sm text-text-main"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="flex-1 py-2 text-sm text-subtext border border-card-border rounded-lg"
            >
              초기화
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-2 text-sm text-white bg-primary rounded-lg font-bold"
            >
              적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
