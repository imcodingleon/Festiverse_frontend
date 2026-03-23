export function LoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card-light rounded-lg border border-card-border p-5 animate-pulse"
        >
          <div className="h-3 w-24 bg-surface rounded mb-3" />
          <div className="h-7 w-16 bg-surface rounded mb-4" />
          <div className="h-16 bg-surface rounded" />
        </div>
      ))}
    </div>
  );
}
