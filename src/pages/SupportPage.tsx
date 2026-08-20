import { useEffect, useState } from 'react';
import { PageContainer } from '../components/PageContainer/PageContainer';
import { QuantitySelector } from '../components/QuantitySelector/QuantitySelector';
import { SupportCodeInput } from '../components/SupportCodeInput/SupportCodeInput';
import { SupportProgress } from '../components/SupportProgress/SupportProgress';
import type { SupportPaymentStatus } from '../components/SupportProgress/SupportProgress';

export default function SupportPage() {
  const [supportCode, setSupportCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState<SupportPaymentStatus>('unpaid');
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    if (paymentStatus !== 'processing') return undefined;
    const timer = window.setTimeout(() => setPaymentStatus('completed'), 900);
    return () => window.clearTimeout(timer);
  }, [paymentStatus]);

  const handleCodeChange = (value: string) => {
    setSupportCode(value);
    setCodeError('');
    if (paymentStatus !== 'unpaid') setPaymentStatus('unpaid');
  };

  const handlePayment = () => {
    const normalizedCode = supportCode.trim();
    if (!normalizedCode) {
      setCodeError('Vui lòng nhập mã tiếp sức trước khi thanh toán.');
      return;
    }
    if (normalizedCode.length < 8) {
      setCodeError('Mã tiếp sức phải có ít nhất 8 ký tự.');
      return;
    }
    setCodeError('');
    setPaymentStatus('processing');
  };

  const isProcessing = paymentStatus === 'processing';
  const isCompleted = paymentStatus === 'completed';

  return (
    <PageContainer className="flex flex-col gap-8 pb-12 sm:gap-10 sm:pb-16">
      <div className="pointer-events-none absolute -top-20 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-[#21D4FD]/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 top-64 -z-10 h-[420px] w-[420px] rounded-full bg-[#8A2EFF]/10 blur-[140px]" />

      <header className="flex w-full max-w-[920px] flex-col gap-3">
        <span className="font-mono text-[11px] font-extrabold uppercase tracking-[1.4px] text-[#9AA8FF]">TIẾP SỨC / LUỒNG TỰ ĐỘNG</span>
        <h1 className="text-3xl font-extrabold leading-[1.12] tracking-tight text-[#F2F4FF] md:text-[44px]">Quá trình hoàn thành mã tiếp sức của bạn</h1>
        <p className="text-base leading-[1.5] text-[#8D94AA]">Dán mã tiếp sức, chọn số lượng tài khoản và xem tiến trình xử lý sau khi thanh toán thành công. Nội dung được tách rõ giữa trạng thái chờ thanh toán và đã thanh toán.</p>
      </header>

      <div className="flex w-full flex-col items-start gap-6 lg:flex-row lg:gap-8">
        <section className="flex w-full min-w-0 flex-1 flex-col gap-6 rounded-2xl border border-white/10 bg-[#0C101CEE] p-5 shadow-[0_22px_42px_#00000080] backdrop-blur-[18px] sm:p-7 lg:p-9">
          <span className="font-mono text-xs font-extrabold uppercase tracking-[1.2px] text-[#24D7FF]">MÃ TIẾP SỨC</span>
          <SupportCodeInput value={supportCode} error={codeError} onChange={handleCodeChange} />

          <div className="flex w-full flex-col gap-4 sm:flex-row">
            <div className="flex w-full flex-col gap-2 rounded-2xl border border-[#7887BE33] bg-[#101525] p-4 sm:w-1/2">
              <span className="font-mono text-[11px] font-extrabold uppercase text-[#566079]">SỐ LƯỢNG</span>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-extrabold text-[#F2F4FF] sm:text-[22px]">{quantity < 10 ? `0${quantity}` : quantity} tài khoản</span>
                <QuantitySelector value={quantity} onChange={setQuantity} />
              </div>
              <span className="text-xs text-[#8D94AA]">Có thể thay đổi trước khi thanh toán</span>
            </div>

            <div className={`flex w-full flex-col gap-2 rounded-2xl border p-4 sm:w-1/2 ${isCompleted ? 'border-[#2DD4BF55] bg-[#071B1C]' : 'border-[#7887BE33] bg-[#101525]'}`}>
              <span className="font-mono text-[11px] font-extrabold uppercase text-[#2DD4BF]">TRẠNG THÁI</span>
              <span className={`text-xl font-extrabold sm:text-[22px] ${isCompleted ? 'text-[#42E6A4]' : isProcessing ? 'text-[#24D7FF]' : 'text-[#F2F4FF]'}`}>
                {isCompleted ? 'Đã thanh toán' : isProcessing ? 'Đang xử lý' : 'Chờ thanh toán'}
              </span>
              <span className="text-xs text-[#8D94AA]">{isCompleted ? 'Tiến trình tự động đang thực thi' : isProcessing ? 'Đang xác nhận giao dịch' : 'Tiến trình sẽ chạy sau khi xác nhận'}</span>
            </div>
          </div>

          <button type="button" onClick={handlePayment} disabled={isProcessing || isCompleted} className="h-14 w-full rounded-2xl bg-gradient-to-r from-[#21D4FD] via-[#5B78FF] to-[#8A2EFF] text-base font-extrabold text-white shadow-[0_16px_32px_#5B78FF55] transition-all hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[62px] sm:text-lg">
            {isCompleted ? 'Đã kích hoạt thanh toán' : isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
          </button>

          <div className="flex w-full items-start gap-2.5 rounded-xl border border-[#7887BE22] bg-[#07080D99] p-3.5">
            <span className={`mt-1 h-[7px] w-[7px] shrink-0 rounded-full ${isProcessing ? 'bg-[#24D7FF]' : 'bg-[#42E6A4]'}`} />
            <span className="text-xs leading-relaxed text-[#8D94AA]">{isCompleted ? 'Thanh toán đã được xác nhận. Tiến trình xử lý đang được cập nhật ở thẻ bên phải.' : 'Sau khi thanh toán, danh sách tiến trình sẽ được cập nhật ở thẻ bên phải.'}</span>
          </div>
        </section>

        <SupportProgress status={paymentStatus} />
      </div>
    </PageContainer>
  );
}
