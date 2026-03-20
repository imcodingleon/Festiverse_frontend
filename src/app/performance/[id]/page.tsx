"use client";

import { use } from "react";
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

export default function PerformanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { detailState, blogState, ticketState } = usePerformanceDetail(id);

  return (
    <AppLayout>
      <DetailHeader />
      <main className="max-w-[375px] lg:max-w-5xl mx-auto">
        {detailState.status === "LOADING" && <DetailSkeleton />}

        {detailState.status === "LOADED" && (
          <>
            {/* PC: 포스터 좌측 + 정보 우측 */}
            <div className="lg:flex lg:gap-8 lg:px-8 lg:py-6">
              <div className="lg:w-[380px] lg:shrink-0 lg:sticky lg:top-20 lg:self-start">
                <PosterImage
                  src={detailState.data.posterUrl}
                  alt={detailState.data.name}
                />
              </div>
              <div className="lg:flex-1 lg:min-w-0">
                <InfoGrid detail={detailState.data} />
                <StorySection story={detailState.data.story} />
                <TicketSection state={ticketState} relatedLinks={detailState.data.relatedLinks} />
              </div>
            </div>

            {/* 리뷰는 전체 너비 */}
            <div className="lg:px-8">
              <ReviewSection blogState={blogState} />
            </div>
          </>
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
