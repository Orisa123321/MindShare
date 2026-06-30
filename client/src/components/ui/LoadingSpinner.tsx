interface LoadingSpinnerProps {
  fullPage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const spinnerSizes = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

export function LoadingSpinner({ fullPage = false, size = 'md' }: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={`${spinnerSizes[size]} rounded-full border-primary-500/30 border-t-primary-500 animate-spin`}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin" />
          <p className="text-sm font-medium animate-pulse-soft" style={{ color: 'var(--text-muted)' }}>
            Loading…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card-flat animate-fade-in">
      <div className="skeleton h-4 w-3/4 mb-3" />
      <div className="skeleton h-3 w-full mb-2" />
      <div className="skeleton h-3 w-2/3 mb-4" />
      <div className="flex items-center gap-2">
        <div className="skeleton w-8 h-8 rounded-full" />
        <div className="skeleton h-3 w-24" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
