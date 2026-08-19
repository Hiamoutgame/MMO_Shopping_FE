import { useState } from 'react';

export default function SupportPage() {
  const [supportCode, setSupportCode] = useState('');
  const [quantity, setQuantity] = useState(3);
  const [isPaid, setIsPaid] = useState(false);

  const handlePayment = () => {
    if (!supportCode.trim()) {
      alert('Vui lòng nhập mã tiếp sức hợp lệ trước khi thanh toán.');
      return;
    }
    setIsPaid(true);
  };

  return (
    <div className="w-full max-w-[1440px] px-6 lg:px-[120px] pt-8 pb-16 flex flex-col gap-9 relative text-[#F2F4FF]">
      {/* Background Atmosphere Glows */}
      <div className="absolute w-[600px] h-[600px] bg-[#21D4FD]/10 rounded-full blur-[140px] pointer-events-none top-0 left-1/4 -z-10" />
      <div className="absolute w-[500px] h-[500px] bg-[#8A2EFF]/10 rounded-full blur-[140px] pointer-events-none top-96 right-10 -z-10" />

      {/* 4. Hero / Page title */}
      <div className="w-full max-w-[920px] flex flex-col gap-4">
        <span className="font-mono text-[11px] font-extrabold tracking-[1.4px] uppercase text-[#9AA8FF]">
          TIẾP SỨC / LUỒNG TỰ ĐỘNG
        </span>
        <h1 className="text-3xl md:text-[44px] font-extrabold text-[#F2F4FF] leading-[1.12] tracking-tight">
          Quá trình hoàn thành mã tiếp sức của bạn
        </h1>
        <p className="text-[#8D94AA] text-base leading-[1.5]">
          Dán mã tiếp sức, chọn số lượng tài khoản và xem tiến trình xử lý sau khi thanh toán thành công. Nội dung được tách rõ giữa trạng thái chờ thanh toán và đã thanh toán.
        </p>
      </div>

      {/* 5. Main content layout: Khu vực thao tác tiếp sức */}
      <div className="w-full flex flex-col lg:flex-row items-start gap-10">
        
        {/* Left card: Thẻ nhập mã tiếp sức */}
        <div className="flex-1 w-full rounded-[24px] bg-[#0C101CEE] border border-white/10 shadow-[0_22px_42px_#00000080] p-6 sm:p-9 flex flex-col gap-6 backdrop-blur-[18px]">
          {/* Label */}
          <span className="font-mono text-xs font-extrabold tracking-[1.2px] uppercase text-[#24D7FF]">
            MÃ TIẾP SỨC
          </span>

          {/* Large Input Box */}
          <div className="w-full min-h-[132px] rounded-[18px] bg-[#05070D] border border-[#26354C] p-6 flex flex-col justify-between focus-within:border-[#21D4FD] transition-colors">
            <textarea
              rows={2}
              value={supportCode}
              onChange={(e) => setSupportCode(e.target.value)}
              placeholder="VD: TS8X 24GE MR2X QZ..."
              className="w-full bg-transparent border-none outline-none font-mono text-base tracking-[1.1px] text-[#F2F4FF] placeholder-[#64748B] resize-none"
            />
            <span className="text-[13px] text-[#566079] leading-[1.45]">
              Dán mã vào đây. Hệ thống sẽ kiểm tra hiệu lực trước khi chuyển sang thanh toán.
            </span>
          </div>

          {/* Quick Payment Info Row */}
          <div className="w-full flex flex-col sm:flex-row gap-7">
            {/* Card 1: Ô Số lượng tài khoản */}
            <div className="w-full sm:w-1/2 rounded-[18px] bg-[#101525] border border-[#7887BE33] p-[18px] flex flex-col gap-2">
              <span className="font-mono text-[11px] font-extrabold text-[#566079] uppercase">
                SỐ LƯỢNG
              </span>
              <div className="flex items-center justify-between">
                <span className="text-[22px] font-extrabold text-[#F2F4FF]">
                  {quantity < 10 ? `0${quantity}` : quantity} tài khoản
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-6 h-6 rounded flex items-center justify-center bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-6 h-6 rounded flex items-center justify-center bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
              <span className="text-xs text-[#8D94AA]">
                Có thể thay đổi trước khi thanh toán
              </span>
            </div>

            {/* Card 2: Ô Trạng thái thanh toán */}
            <div className="w-full sm:w-1/2 rounded-[18px] bg-[#071B1C] border border-[#2DD4BF55] p-[18px] flex flex-col gap-2">
              <span className="font-mono text-[11px] font-extrabold text-[#2DD4BF] uppercase">
                TRẠNG THÁI
              </span>
              <span className="text-[22px] font-extrabold text-[#42E6A4]">
                {isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}
              </span>
              <span className="text-xs text-[#8D94AA]">
                {isPaid ? 'Tiến trình tự động đang thực thi' : 'Tiến trình sẽ chạy sau khi xác nhận'}
              </span>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={handlePayment}
            className="w-full h-[62px] rounded-[16px] bg-gradient-to-r from-[#21D4FD] via-[#5B78FF] to-[#8A2EFF] shadow-[0_16px_32px_#5B78FF55] text-white font-extrabold text-lg hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
          >
            {isPaid ? 'Đã kích hoạt thanh toán' : 'Thanh toán'}
          </button>

          {/* Payment Note */}
          <div className="w-full rounded-[12px] bg-[#07080D99] border border-[#7887BE22] p-[14px] flex items-center gap-[10px]">
            <span className="w-[7px] h-[7px] rounded-full bg-[#42E6A4] shrink-0" />
            <span className="text-xs text-[#8D94AA]">
              Sau khi thanh toán, danh sách tiến trình sẽ xuất hiện ở thẻ bên phải.
            </span>
          </div>
        </div>

        {/* Right card: Thẻ trạng thái tiến trình */}
        <div className="w-full lg:w-[400px] rounded-[24px] bg-[#0B1020EE] border border-white/10 shadow-[0_22px_42px_#00000080] p-7 flex flex-col gap-[22px] backdrop-blur-[18px] shrink-0">
          {/* Label */}
          <span className="font-mono text-[11px] font-extrabold tracking-[1.2px] uppercase text-[#9AA8FF]">
            TIẾN TRÌNH / SAU THANH TOÁN
          </span>

          {/* Unpaid Status Card */}
          <div className="w-full rounded-[16px] bg-[#07080D] border border-[#7887BE22] p-[18px] flex flex-col gap-[10px]">
            <span className="text-[15px] font-extrabold text-[#F2F4FF]">
              {isPaid ? 'Thanh toán thành công' : 'Chưa thanh toán'}
            </span>
            <p className="text-[13px] text-[#8D94AA] leading-[1.4]">
              {isPaid
                ? 'Đơn hàng đã được xác nhận. Hệ thống đang tiến hành xử lý tạo tài khoản.'
                : 'Chưa có tài khoản nào được tạo. Hãy hoàn tất thanh toán để bắt đầu tiến trình tự động.'}
            </p>
          </div>

          {/* Paid Progress Section */}
          <div className="w-full flex flex-col gap-[14px] pt-1">
            <span className="text-sm font-extrabold text-[#42E6A4]">
              {isPaid ? 'Đã thanh toán · Hoàn tất 65%' : 'Đã thanh toán · Hoàn tất 38%'}
            </span>

            {/* Progress Bar */}
            <div className="w-full h-4 rounded-full bg-[#07080D] border border-[#7887BE22] p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#21D4FD] to-[#8A2EFF] transition-all duration-700"
                style={{ width: isPaid ? '65%' : '38%' }}
              />
            </div>

            {/* Progress List */}
            <div className="w-full flex flex-col divide-y divide-white/5 pt-2">
              <div className="flex items-center justify-between py-2">
                <span className="text-[13px] text-[#DCE4F8]">Kiểm tra mã tiếp sức</span>
                <span className="font-mono text-[11px] uppercase font-bold text-[#42E6A4]">
                  Hoàn tất
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[13px] text-[#DCE4F8]">Xác nhận thanh toán</span>
                <span className="font-mono text-[11px] uppercase font-bold text-[#42E6A4]">
                  Hoàn tất
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[13px] text-[#DCE4F8]">Tạo tài khoản</span>
                <span className="font-mono text-[11px] uppercase font-bold text-[#24D7FF]">
                  {isPaid ? 'Đang xử lý' : 'Đang xử lý'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[13px] text-[#DCE4F8]">Gửi thông tin đăng nhập</span>
                <span className="font-mono text-[11px] uppercase font-bold text-[#8D94AA]">
                  {isPaid ? 'Đang chuẩn bị' : 'Chờ'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
