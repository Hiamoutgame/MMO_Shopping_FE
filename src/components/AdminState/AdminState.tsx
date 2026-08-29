export function AdminLoading() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0B1020] px-6 text-center">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#162033CC] border-t-[#0EA5FF]" />
      <p className="mt-3 text-sm font-medium text-[#7F8BA5]">Đang tải dữ liệu...</p>
    </div>
  );
}

export interface AdminErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function AdminError({ message, onRetry }: AdminErrorProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0B1020] px-6 text-center">
      <h2 className="text-[16px] font-extrabold text-white">Không thể tải dữ liệu</h2>
      <p className="mt-2 max-w-[380px] text-[13px] leading-6 text-[#7F8BA5]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 h-9 rounded-[10px] border border-white/10 px-4 text-[12px] font-extrabold text-[#CBD5E1] transition-colors hover:border-[#35FFB1]/40 hover:text-white"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}

export interface AdminEmptyProps {
  title?: string;
  description?: string;
}

export function AdminEmpty({ title = 'Không có dữ liệu', description }: AdminEmptyProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0B1020] px-6 text-center">
      <h2 className="text-[16px] font-extrabold text-white">{title}</h2>
      {description && (
        <p className="mt-2 max-w-[380px] text-[13px] leading-6 text-[#7F8BA5]">{description}</p>
      )}
    </div>
  );
}
