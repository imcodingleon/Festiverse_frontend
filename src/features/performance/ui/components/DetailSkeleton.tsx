export function DetailSkeleton() {
  return (
    <div className="animate-pulse max-w-[375px] mx-auto">
      <div className="px-4 py-4">
        <div className="aspect-[3/4] w-full bg-surface rounded-lg border border-border-light" />
      </div>
      <div className="px-4 pb-6 space-y-3">
        <div className="h-7 bg-surface rounded w-3/4" />
        <div className="h-20 bg-surface rounded-lg border border-border-light" />
        <div className="h-20 bg-surface rounded-lg border border-border-light" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-surface rounded-lg border border-border-light" />
          <div className="h-24 bg-surface rounded-lg border border-border-light" />
        </div>
      </div>
    </div>
  );
}
