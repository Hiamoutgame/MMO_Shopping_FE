import { cn } from '../../common/libs/cn';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <nav className={cn('flex items-center justify-end gap-2', className)} aria-label="Phân trang">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="h-8 rounded-[8px] border border-white/10 px-3 text-[12px] font-bold text-[#94A3B8] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Trước
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            'h-8 min-w-8 rounded-[8px] border px-2 text-[12px] font-bold transition-colors',
            p === page
              ? 'border-[#0EA5FF]/40 bg-[#121A2E] text-white'
              : 'border-white/10 text-[#7F8BA5] hover:text-white',
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="h-8 rounded-[8px] border border-white/10 px-3 text-[12px] font-bold text-[#94A3B8] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sau
      </button>
    </nav>
  );
}
