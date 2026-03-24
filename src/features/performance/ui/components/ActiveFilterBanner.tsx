"use client";

import { Icon } from "@/ui/components/Icon";

interface ActiveFilterBannerProps {
  region: string;
  genre: string;
  onRemoveFilter: (type: "region" | "genre") => void;
  onDismiss: () => void;
}

export function ActiveFilterBanner({
  region,
  genre,
  onRemoveFilter,
  onDismiss,
}: ActiveFilterBannerProps) {
  const tags = [
    ...(region ? [{ label: region, type: "region" as const }] : []),
    ...(genre ? [{ label: genre, type: "genre" as const }] : []),
  ];

  if (tags.length === 0) return null;

  const description = tags.map((t) => t.label).join(" \u00B7 ");

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 space-y-2">
      {/* 안내 문구 */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-text-main">
          <span className="font-bold text-primary">{description}</span> 공연을
          추천해드려요
        </p>
        <button
          onClick={onDismiss}
          className="shrink-0 text-subtext hover:text-text-main transition-colors cursor-pointer"
          aria-label="배너 닫기"
        >
          <Icon name="close" className="text-base" />
        </button>
      </div>

      {/* 필터 태그 바 */}
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <span
            key={tag.type}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
          >
            {tag.label}
            <button
              onClick={() => onRemoveFilter(tag.type)}
              className="hover:text-primary/70 transition-colors cursor-pointer"
              aria-label={`${tag.label} 필터 해제`}
            >
              <Icon name="close" className="text-sm" />
            </button>
          </span>
        ))}
        <span className="text-xs text-subtext">
          필터를 변경하거나 해제할 수 있어요
        </span>
      </div>
    </div>
  );
}
