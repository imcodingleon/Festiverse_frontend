"use client";

import type { BlogReviewState } from "@/features/performance/domain/state/blogReviewState";
import { BlogReviewItem } from "./BlogReviewItem";
import { Icon } from "@/ui/components/Icon";

interface ReviewSectionProps {
  blogState: BlogReviewState;
}

export function ReviewSection({ blogState }: ReviewSectionProps) {
  return (
    <div className="mt-2">
      <div className="px-4 flex items-center gap-2 mb-4">
        <Icon name="reviews" className="text-primary font-bold" />
        <h2 className="text-lg font-bold text-text-main">블로그 리뷰</h2>
      </div>

      <div className="px-4 pb-10">
        {blogState.status === "LOADING" && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-surface rounded-lg h-20 border border-border-light"
              />
            ))}
          </div>
        )}

        {blogState.status === "LOADED" && blogState.data.length > 0 && (
          <div className="space-y-3">
            {blogState.data.map((review, i) => (
              <BlogReviewItem key={i} review={review} />
            ))}
          </div>
        )}

        {blogState.status === "LOADED" && blogState.data.length === 0 && (
          <p className="text-sm text-subtext text-center py-8">
            블로그 리뷰가 없습니다.
          </p>
        )}

        {blogState.status === "ERROR" && (
          <p className="text-sm text-secondary text-center py-8">
            리뷰를 불러오지 못했습니다.
          </p>
        )}
      </div>
    </div>
  );
}
