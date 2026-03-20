export function PerformanceCardSkeleton() {
  return (
    <div className="bg-card-light rounded-lg overflow-hidden border border-card-border flex shadow-sm animate-pulse">
      <div className="w-28 h-36 shrink-0 bg-surface" />
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <div className="h-4 bg-surface rounded w-3/4 mb-2" />
          <div className="h-3 bg-surface rounded w-1/2 mb-1" />
          <div className="h-3 bg-surface rounded w-2/3" />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="h-3 bg-surface rounded w-16" />
          <div className="h-4 w-4 bg-surface rounded-full" />
        </div>
      </div>
    </div>
  );
}
