export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-alt rounded-sm ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-sm p-4 space-y-3">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}
