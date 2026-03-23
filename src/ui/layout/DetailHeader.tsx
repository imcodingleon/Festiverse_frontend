"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/ui/components/Icon";
import { useDetailPageTracking } from "@/infrastructure/tracking/useDetailPageTracking";
import { getCurrentDetailFestivalId } from "@/infrastructure/tracking/trackingState";

export function DetailHeader() {
  const router = useRouter();
  const { trackShareButtonClicked, trackFavoriteToggled } = useDetailPageTracking();
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = () => {
    const next = !isFavorited;
    setIsFavorited(next);
    trackFavoriteToggled(getCurrentDetailFestivalId(), next, "detail");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-light">
      <div className="flex items-center justify-between px-4 lg:px-8 h-14 max-w-[375px] lg:max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-primary"
        >
          <Icon name="chevron_left" className="text-[24px]" />
          <span className="text-sm font-bold tracking-tight">목록으로</span>
        </button>
        <div className="flex gap-4">
          <button type="button" onClick={() => trackShareButtonClicked()}>
            <Icon name="share" className="text-subtext" />
          </button>
          <button type="button" onClick={handleFavorite}>
            <Icon
              name="favorite"
              className={isFavorited ? "text-secondary" : "text-subtext"}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
