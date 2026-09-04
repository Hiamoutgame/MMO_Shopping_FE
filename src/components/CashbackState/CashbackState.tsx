import { Button } from '../Button/Button';

export function CashbackLoading({ label = 'Đang tải dữ liệu...' }: { label?: string }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0C101EEE] p-8 text-center">
      <span className="mb-3 h-9 w-9 animate-spin rounded-full border-4 border-[#162033] border-t-[#0EA5FF]" />
      <p className="text-sm text-[#94A3B8]">{label}</p>
    </div>
  );
}

export function CashbackError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-[#FF5C5C]/25 bg-[#0C101EEE] p-8 text-center">
      <h2 className="text-lg font-bold text-white">Không thể tải dữ liệu</h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#94A3B8]">{message}</p>
      {onRetry && <Button className="mt-5" variant="secondary" onClick={onRetry}>Thử lại</Button>}
    </div>
  );
}

export function CashbackEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#080B14] p-8 text-center">
      <h2 className="font-bold text-white">{title}</h2>
      <p className="mt-2 max-w-lg text-sm text-[#94A3B8]">{description}</p>
    </div>
  );
}
