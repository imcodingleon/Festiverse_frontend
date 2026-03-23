"use client";

import { Fragment, use } from "react";
import { AppLayout } from "@/ui/layout/AppLayout";
import { DetailHeader } from "@/ui/layout/DetailHeader";
import { PosterImage } from "@/features/performance/ui/components/PosterImage";
import { InfoGrid } from "@/features/performance/ui/components/InfoGrid";
import { StorySection } from "@/features/performance/ui/components/StorySection";
import { TicketSection } from "@/features/performance/ui/components/TicketSection";
import { ReviewSection } from "@/features/performance/ui/components/ReviewSection";
import { DetailSkeleton } from "@/features/performance/ui/components/DetailSkeleton";
import { ErrorState } from "@/features/performance/ui/components/ErrorState";
import { usePerformanceDetail } from "@/features/performance/application/hooks/usePerformanceDetail";
import { useDetailPageLifecycle } from "@/infrastructure/tracking/useDetailPageTracking";

export default function PerformanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { detailState, blogState, ticketState } = usePerformanceDetail(id);
  const festivalName =
    detailState.status === "LOADED" ? detailState.data.name : undefined;
  const { createSectionRef } = useDetailPageLifecycle(id, festivalName);

  return (
    <AppLayout>
      <DetailHeader />
      <main className="max-w-[375px] lg:max-w-5xl mx-auto">
        {detailState.status === "LOADING" && <DetailSkeleton />}

        {detailState.status === "LOADED" && (
          <Fragment key={id}>
            {/* PC: 포스터 좌측 + 정보 우측 */}
            <div className="lg:flex lg:gap-8 lg:px-8 lg:py-6">
              <div className="lg:w-[380px] lg:shrink-0 lg:sticky lg:top-20 lg:self-start">
                <div ref={createSectionRef("hero")}>
                  <PosterImage
                    src={detailState.data.posterUrl}
                    alt={detailState.data.name}
                  />
                </div>
              </div>
              <div className="lg:flex-1 lg:min-w-0">
                <div ref={createSectionRef("basic_info")}>
                  <InfoGrid
                    detail={detailState.data}
                    sectionRefs={{
                      lineup: createSectionRef("lineup"),
                      ticketPrice: createSectionRef("ticket_price"),
                    }}
                  />
                </div>
                <StorySection story={detailState.data.story} />
                <div ref={createSectionRef("ticket_booking")}>
                  <TicketSection state={ticketState} relatedLinks={detailState.data.relatedLinks} />
                </div>
              </div>
            </div>

            {/* 리뷰는 전체 너비 */}
            <div className="lg:px-8">
              <div ref={createSectionRef("blog_review")}>
                <ReviewSection blogState={blogState} />
              </div>
            </div>
          </Fragment>
        )}

        {detailState.status === "ERROR" && (
          <div className="px-4 py-8">
            <ErrorState message={detailState.message} />
          </div>
        )}
      </main>
    </AppLayout>
  );
}
