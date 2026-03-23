"use client";

import { Icon } from "@/ui/components/Icon";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  message = "데이터를 불러올 수 없습니다.",
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon name="error_outline" className="text-4xl text-secondary mb-3" />
      <p className="text-sm text-subtext mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
