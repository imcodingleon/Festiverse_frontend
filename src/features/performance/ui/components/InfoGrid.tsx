import { Icon } from "@/ui/components/Icon";
import type { PerformanceDetail } from "@/features/performance/domain/model/performance";

interface InfoGridProps {
  detail: PerformanceDetail;
  sectionRefs?: {
    lineup?: (node: HTMLElement | null) => void;
    ticketPrice?: (node: HTMLElement | null) => void;
  };
}

export function InfoGrid({ detail, sectionRefs }: InfoGridProps) {
  return (
    <div className="px-4 pb-6">
      <h1 className="text-2xl font-bold leading-tight tracking-tight mb-4 text-text-main">
        {detail.name}
      </h1>
      <div className="grid grid-cols-1 gap-3 mb-6">
        <div className="bg-surface p-4 rounded-lg border border-border-light flex items-center gap-4">
          <Icon name="calendar_today" className="text-primary text-xl" />
          <div>
            <p className="text-[10px] text-subtext uppercase font-bold tracking-wider">
              Date &amp; Time
            </p>
            <p className="text-sm font-semibold">
              {detail.timeGuide?.includes("~")
                ? detail.timeGuide.split(",").map((r, i) => {
                    const [s, e] = r.trim().split("~");
                    return (
                      <span key={i}>
                        {i > 0 && <br />}
                        {s?.trim()} ~ {e?.trim()}
                      </span>
                    );
                  })
                : `${detail.startDate} ~ ${detail.endDate}${detail.timeGuide ? ` | ${detail.timeGuide}` : ""}`}
            </p>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-border-light flex items-center gap-4">
          <Icon name="location_on" className="text-primary text-xl" />
          <div>
            <p className="text-[10px] text-subtext uppercase font-bold tracking-wider">
              Venue
            </p>
            <p className="text-sm font-semibold">
              {detail.venueName}
              {detail.venue?.address && ` (${detail.venue.address})`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface p-4 rounded-lg border border-border-light">
            <Icon name="category" className="text-primary text-xl mb-1" />
            <p className="text-[10px] text-subtext uppercase font-bold tracking-wider">
              Genre
            </p>
            <p className="text-sm font-semibold text-secondary">{detail.genre}</p>
          </div>
          <div className="bg-surface p-4 rounded-lg border border-border-light">
            <Icon name="verified_user" className="text-primary text-xl mb-1" />
            <p className="text-[10px] text-subtext uppercase font-bold tracking-wider">
              Age
            </p>
            <p className="text-sm font-semibold">{detail.ageRating || "정보 없음"}</p>
          </div>
        </div>

        {detail.cast && (
          <div ref={sectionRefs?.lineup} className="bg-surface p-4 rounded-lg border border-border-light">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="groups" className="text-primary text-xl" />
              <p className="text-[10px] text-subtext uppercase font-bold tracking-wider">
                Lineup
              </p>
            </div>
            <p className="text-sm font-medium leading-relaxed">{detail.cast}</p>
          </div>
        )}

        {detail.priceGuide && (
          <div ref={sectionRefs?.ticketPrice} className="bg-surface p-4 rounded-lg border border-border-light">
            <p className="text-[10px] text-subtext uppercase font-bold tracking-wider mb-2">
              Ticket Price
            </p>
            <p className="text-sm font-semibold text-primary whitespace-pre-line">
              {detail.priceGuide}
            </p>
            {detail.discounts.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border-light space-y-1.5">
                {detail.discounts.map((d, i) => (
                  <div key={i} className="flex items-baseline gap-2 text-sm">
                    <span>🏷</span>
                    <span className="font-semibold text-text-main">{d.seatType}</span>
                    <span className="font-bold text-secondary">
                      {d.price.toLocaleString()}원
                    </span>
                    <span className="text-subtext text-xs">({d.vendorName})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
