"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/ui/components/Icon";
import { Badge } from "@/ui/components/Badge";
import type { PerformanceSummary } from "@/features/performance/domain/model/performance";
import { formatDday, isDdayPast, formatDateRange } from "@/features/performance/domain/model/utils";
import { useSearchPageTracking } from "@/infrastructure/tracking/useSearchPageTracking";

interface PerformanceCardProps {
  performance: PerformanceSummary;
  index: number;
}

export function PerformanceCard({ performance, index }: PerformanceCardProps) {
  const { trackFestivalItemClicked, trackFavoriteToggled } = useSearchPageTracking();
  const [isFavorited, setIsFavorited] = useState(false);
  const dday = formatDday(performance.startDate);
  const past = isDdayPast(performance.startDate);

  return (
    <Link
      href={`/performance/${performance.id}`}
      onClick={() => trackFestivalItemClicked(performance.id, performance.name, index)}
    >
      <div className="bg-card-light rounded-lg overflow-hidden border border-card-border flex lg:flex-col shadow-sm hover:shadow-md transition-shadow">
        <div className="w-28 h-36 lg:w-full lg:h-64 shrink-0 relative">
          {performance.posterUrl ? (
            <Image
              alt={performance.name}
              className="w-full h-full object-cover"
              src={performance.posterUrl}
              fill
              sizes="(max-width: 1024px) 112px, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-surface flex items-center justify-center">
              <Icon name="image" className="text-subtext/30 text-3xl" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge label={dday} variant={past ? "muted" : "default"} />
          </div>
        </div>

        <div className="p-3 lg:p-4 flex flex-col justify-between flex-1 min-w-0">
          <div>
            <h4 className="font-bold text-sm lg:text-base line-clamp-1 mb-1 text-text-main">
              {performance.name}
            </h4>
            <p className="text-[10px] lg:text-xs text-subtext flex items-center gap-1">
              <Icon name="calendar_today" className="text-[12px] lg:text-[14px] text-primary" />
              {formatDateRange(performance.startDate, performance.endDate)}
            </p>
            <p className="text-[10px] lg:text-xs text-subtext flex items-center gap-1 mt-1">
              <Icon name="location_on" className="text-[12px] lg:text-[14px] text-primary" />
              {performance.venueName}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-bold text-accent-green">
              #{performance.genre}
            </span>
            <button
              type="button"
              className="lg:hidden"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const next = !isFavorited;
                setIsFavorited(next);
                trackFavoriteToggled(performance.id, next, "search");
              }}
            >
              <Icon
                name="favorite"
                className={`text-lg ${isFavorited ? "text-secondary" : "text-subtext/40"}`}
              />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
