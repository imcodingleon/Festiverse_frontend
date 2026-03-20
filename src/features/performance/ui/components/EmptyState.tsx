import { Icon } from "@/ui/components/Icon";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon name="search_off" className="text-5xl text-subtext/30 mb-4" />
      <p className="text-sm font-medium text-subtext">검색 결과가 없습니다</p>
      <p className="text-xs text-subtext/60 mt-1">
        다른 검색어나 필터를 시도해보세요
      </p>
    </div>
  );
}
