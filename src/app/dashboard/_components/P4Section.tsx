"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchP4Views } from "@/infrastructure/dashboard/dashboardApi";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorMessage } from "./ErrorMessage";
import { safePct, safeNum } from "./dashboardFormat";

function useDashboardFetch<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e: Error) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [fetcher, fetchKey]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setData(null);
    setFetchKey((k) => k + 1);
  }, []);

  return { data, error, loading, retry };
}

interface P4SectionProps {
  dateTo: string;
}

export function P4Section({ dateTo }: P4SectionProps) {
  const fetcher = useCallback(() => fetchP4Views(dateTo), [dateTo]);
  const { data, error, loading, retry } = useDashboardFetch(fetcher);
  const [showUsers, setShowUsers] = useState(false);

  if (loading) return <LoadingSkeleton count={4} />;
  if (error || !data) return <ErrorMessage message={error ?? undefined} onRetry={retry} />;

  const conv = data.conversion.data?.rows?.[0];
  const intentCount = data.intentUsers.data?.total ?? 0;
  const users = data.intentUsers.data?.rows ?? [];

  return (
    <section>
      <h2 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
        <span className="w-2 h-5 bg-accent-yellow rounded-full inline-block" />
        P4 — 재방문 (집계 시점: {dateTo})
      </h2>

      <p className="text-xs text-subtext mb-4">
        Intent 윈도우: D-21 ~ D-14 내 예매 클릭 사용자 대상, anchor_time 이후 14일 이내 재방문 판정
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card-light rounded-lg border border-card-border p-5">
          <p className="text-xs font-medium text-subtext mb-1">Intent 사용자 수</p>
          <p className="text-2xl font-bold text-text-main">{safeNum(intentCount)}</p>
        </div>
        <div className="bg-card-light rounded-lg border border-card-border p-5">
          <p className="text-xs font-medium text-subtext mb-1">Broad 재방문</p>
          <p className="text-2xl font-bold text-text-main">
            {conv ? safeNum(conv.reuse_broad) : "-"}
          </p>
          <p className="text-xs text-primary font-bold mt-1">
            {conv ? safePct(conv.p4_broad_rate) : "-"}
          </p>
        </div>
        <div className="bg-card-light rounded-lg border border-card-border p-5">
          <p className="text-xs font-medium text-subtext mb-1">Strict 재방문</p>
          <p className="text-2xl font-bold text-text-main">
            {conv ? safeNum(conv.reuse_strict) : "-"}
          </p>
          <p className="text-xs text-accent-green font-bold mt-1">
            {conv ? safePct(conv.p4_strict_rate) : "-"}
          </p>
        </div>
        <div className="bg-card-light rounded-lg border border-card-border p-5">
          <p className="text-xs font-medium text-subtext mb-1">Broad / Strict 비율</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-primary">{conv ? safePct(conv.p4_broad_rate) : "-"}</span>
            <span className="text-subtext">/</span>
            <span className="text-lg font-bold text-accent-green">{conv ? safePct(conv.p4_strict_rate) : "-"}</span>
          </div>
        </div>
      </div>

      {users.length > 0 && (
        <div className="bg-card-light rounded-lg border border-card-border p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-text-main">Intent 사용자 목록 ({users.length}명)</p>
            <button
              onClick={() => setShowUsers(!showUsers)}
              className="text-xs text-primary font-medium hover:underline"
            >
              {showUsers ? "접기" : "펼치기"}
            </button>
          </div>
          {showUsers && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="text-left py-2 px-2 text-subtext font-medium">#</th>
                    <th className="text-left py-2 px-2 text-subtext font-medium">anonymous_id</th>
                    <th className="text-left py-2 px-2 text-subtext font-medium">anchor_time</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.anonymous_id} className="border-b border-border-light/50">
                      <td className="py-2 px-2 text-subtext">{i + 1}</td>
                      <td className="py-2 px-2 font-mono text-text-main">{u.anonymous_id.slice(0, 12)}...</td>
                      <td className="py-2 px-2 text-subtext">{u.anchor_time.replace("T", " ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
