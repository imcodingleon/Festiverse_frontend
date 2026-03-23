"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "./_components/DashboardHeader";
import { P1Section } from "./_components/P1Section";
import { P2Section } from "./_components/P2Section";
import { P3Section } from "./_components/P3Section";
import { P4Section } from "./_components/P4Section";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const today = useMemo(() => formatDate(new Date()), []);
  const weekAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return formatDate(d);
  }, []);

  const [dateFrom, setDateFrom] = useState(weekAgo);
  const [dateTo, setDateTo] = useState(today);

  const dateParams = useMemo(() => ({ dateFrom, dateTo }), [dateFrom, dateTo]);
  const paramsKey = `${dateFrom}-${dateTo}`;

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <DashboardHeader
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />

        <div className="space-y-10">
          <P1Section key={`p1-${paramsKey}`} dateParams={dateParams} />
          <P2Section key={`p2-${paramsKey}`} dateParams={dateParams} />
          <P3Section key={`p3-${paramsKey}`} dateParams={dateParams} />
          <P4Section key={`p4-${dateTo}`} dateTo={dateTo} />
        </div>
      </div>
    </div>
  );
}
