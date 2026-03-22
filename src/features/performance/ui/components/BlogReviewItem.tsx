"use client";

import { Icon } from "@/ui/components/Icon";
import type { BlogReview } from "@/features/performance/domain/model/blogReview";
import { useDetailPageTracking } from "@/infrastructure/tracking/useDetailPageTracking";

interface BlogReviewItemProps {
  review: BlogReview;
  index: number;
}

export function BlogReviewItem({ review, index }: BlogReviewItemProps) {
  const { trackBlogReviewClicked } = useDetailPageTracking();

  const handleClick = () => {
    trackBlogReviewClicked(index, review.title, review.link);
  };

  return (
    <a
      href={review.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="bg-surface border border-border-light rounded-lg p-4 flex items-center justify-between group cursor-pointer hover:bg-white transition-colors"
    >
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="w-12 h-12 shrink-0 rounded-lg bg-primary/5 flex items-center justify-center overflow-hidden border border-primary/10">
          <Icon name="description" className="text-primary text-2xl" />
        </div>
        <div className="overflow-hidden">
          <h3 className="text-sm font-bold truncate pr-2 text-text-main">
            {review.title}
          </h3>
          <p className="text-xs text-subtext mt-1.5 font-medium">
            {review.postDate} · {review.bloggerName}
          </p>
        </div>
      </div>
      <Icon
        name="chevron_right"
        className="text-subtext group-hover:text-primary transition-colors shrink-0"
      />
    </a>
  );
}
