import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const delta = 1;
    const rangeStart = Math.max(2, page - delta);
    const rangeEnd = Math.min(totalPages - 1, page + delta);

    pages.push(1);
    if (rangeStart > 2) pages.push('ellipsis');
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < totalPages - 1) pages.push('ellipsis');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const btnBase =
    'w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 cursor-pointer';

  return (
    <nav id="pagination" className="flex items-center justify-center gap-1.5 mt-8">
      <button
        id="pagination-prev"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={`${btnBase} disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--surface-2)]`}
        style={{ color: 'var(--text-secondary)' }}
      >
        <ChevronLeft size={16} />
      </button>

      {getPages().map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
            …
          </span>
        ) : (
          <button
            key={p}
            id={`pagination-page-${p}`}
            onClick={() => onPageChange(p)}
            className={`${btnBase} ${
              p === page
                ? 'bg-primary-500 text-white shadow-[0_0_12px_rgba(108,92,231,0.4)]'
                : 'hover:bg-[var(--surface-2)]'
            }`}
            style={p !== page ? { color: 'var(--text-secondary)' } : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        id="pagination-next"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={`${btnBase} disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--surface-2)]`}
        style={{ color: 'var(--text-secondary)' }}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
