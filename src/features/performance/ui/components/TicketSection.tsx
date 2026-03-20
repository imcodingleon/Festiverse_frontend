"use client";

import type { TicketInfoState } from "@/features/performance/domain/state/ticketInfoState";
import type { RelatedLink } from "@/features/performance/domain/model/performance";
import { Icon } from "@/ui/components/Icon";

interface TicketSectionProps {
  state: TicketInfoState;
  relatedLinks?: RelatedLink[];
}

export function TicketSection({ state, relatedLinks = [] }: TicketSectionProps) {
  if (state.status === "LOADING") {
    return (
      <div className="px-4 pb-6">
        <div className="animate-pulse bg-surface rounded-lg h-32 border border-border-light" />
      </div>
    );
  }

  const hasCrawledData = state.status === "LOADED" && state.data.length > 0;
  const hasRelatedLinks = relatedLinks.length > 0;

  // 둘 다 없으면 숨김
  if (!hasCrawledData && !hasRelatedLinks) return null;

  return (
    <div className="px-4 pb-6 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="confirmation_number" className="text-primary font-bold" />
        <h2 className="text-lg font-bold text-text-main">티켓 예매</h2>
      </div>

      {/* 1순위: 크롤링 데이터 */}
      {hasCrawledData &&
        state.data.map((ticket) => (
          <div
            key={ticket.vendorName}
            className="bg-surface p-4 rounded-lg border border-border-light"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-bold text-text-main">{ticket.vendorName}</p>
                <p className="text-[10px] text-subtext mt-0.5">
                  {ticket.bookingStatus === "available"
                    ? "예매 가능"
                    : ticket.bookingStatus === "sold_out"
                      ? "매진"
                      : "확인 필요"}
                </p>
              </div>
              {ticket.vendorUrl && (
                <a
                  href={ticket.vendorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-secondary hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg secondary-glow transition-all active:scale-95 text-sm"
                >
                  예매하기
                </a>
              )}
            </div>
          </div>
        ))}

      {/* 2순위 fallback: KOPIS 예매 링크 */}
      {!hasCrawledData &&
        hasRelatedLinks &&
        relatedLinks.map((link, i) => (
          <div
            key={i}
            className="bg-surface p-4 rounded-lg border border-border-light flex justify-between items-center"
          >
            <p className="text-sm font-bold text-text-main">{link.name}</p>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-secondary hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg secondary-glow transition-all active:scale-95 text-sm"
            >
              예매하기
            </a>
          </div>
        ))}
    </div>
  );
}
