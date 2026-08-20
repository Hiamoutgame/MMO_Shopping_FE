export type SupportPaymentStatus = 'unpaid' | 'processing' | 'completed';

export interface SupportProgressProps {
  status: SupportPaymentStatus;
}

const steps = ['Kiểm tra mã tiếp sức', 'Xác nhận thanh toán', 'Tạo tài khoản', 'Gửi thông tin đăng nhập'];

export function SupportProgress({ status }: SupportProgressProps) {
  const progress = status === 'completed' ? 100 : status === 'processing' ? 65 : 0;
  const statusLabel = status === 'completed' ? 'Thanh toán thành công' : status === 'processing' ? 'Đang xử lý thanh toán' : 'Chưa thanh toán';
  const description = status === 'completed'
    ? 'Đơn hàng đã được xác nhận. Tài khoản đang được tạo và sẽ gửi ngay sau khi hoàn tất.'
    : status === 'processing'
      ? 'Thanh toán đang được xác nhận. Vui lòng giữ nguyên trang trong giây lát.'
      : 'Chưa có tài khoản nào được tạo. Hãy hoàn tất thanh toán để bắt đầu tiến trình tự động.';

  return (
    <aside className="flex w-full flex-col gap-5 rounded-2xl border border-white/10 bg-[#0B1020EE] p-5 shadow-[0_22px_42px_#00000080] backdrop-blur-[18px] lg:w-[400px] lg:shrink-0 lg:p-7">
      <span className="font-mono text-[11px] font-extrabold uppercase tracking-[1.2px] text-[#9AA8FF]">TIẾN TRÌNH / SAU THANH TOÁN</span>

      <div className="flex w-full flex-col gap-2.5 rounded-2xl border border-[#7887BE22] bg-[#07080D] p-4">
        <span className="text-[15px] font-extrabold text-[#F2F4FF]">{statusLabel}</span>
        <p className="text-[13px] leading-[1.4] text-[#8D94AA]">{description}</p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <span className={status === 'unpaid' ? 'text-sm font-extrabold text-[#8D94AA]' : 'text-sm font-extrabold text-[#42E6A4]'}>
          {status === 'unpaid' ? 'Chưa bắt đầu' : `${status === 'completed' ? 'Hoàn tất' : 'Đang xử lý'} · ${progress}%`}
        </span>
        <div className="h-3 w-full overflow-hidden rounded-full border border-[#7887BE22] bg-[#07080D] p-0.5" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Tiến trình xử lý">
          <div className="h-full rounded-full bg-gradient-to-r from-[#21D4FD] to-[#8A2EFF] transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex w-full flex-col divide-y divide-white/5 pt-1">
          {steps.map((step, index) => {
            const isComplete = status === 'completed' || (status === 'processing' && index < 2);
            const isActive = status === 'processing' && index === 2;
            const stepStatus = isComplete ? 'Hoàn tất' : isActive ? 'Đang xử lý' : 'Chờ';
            const color = isComplete ? 'text-[#42E6A4]' : isActive ? 'text-[#24D7FF]' : 'text-[#8D94AA]';
            return (
              <div key={step} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[13px] text-[#DCE4F8]">{step}</span>
                <span className={`shrink-0 font-mono text-[11px] font-bold uppercase ${color}`}>{stepStatus}</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
