import { Icon } from "@/ui/components/Icon";

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon name="error_outline" className="text-5xl text-secondary/50 mb-4" />
      <p className="text-sm font-medium text-text-main">오류가 발생했습니다</p>
      <p className="text-xs text-subtext mt-1">{message}</p>
    </div>
  );
}
