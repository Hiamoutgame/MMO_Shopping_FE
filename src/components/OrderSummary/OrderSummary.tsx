import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { formatCurrency } from '../../common/libs/formatter';

export interface OrderSummaryProps {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  finalTotal: number;
  couponCode: string;
  couponError: string;
  couponSuccess: string;
  email: string;
  onCouponCodeChange: (value: string) => void;
  onApplyCoupon: () => void;
  onEmailChange: (value: string) => void;
  onCheckout: () => void;
}

export function OrderSummary({
  subtotal,
  discountPercent,
  discountAmount,
  finalTotal,
  couponCode,
  couponError,
  couponSuccess,
  email,
  onCouponCodeChange,
  onApplyCoupon,
  onEmailChange,
  onCheckout,
}: OrderSummaryProps) {
  return (
    <aside className="flex flex-col gap-5 rounded-2xl border border-[#7887BE33] bg-[#0C101CEE] p-5 shadow-[0_18px_38px_rgba(0,0,0,0.6)] backdrop-blur-[18px] lg:col-span-5 lg:sticky lg:top-24 lg:p-6">
      <h2 className="border-b border-white/10 pb-3 text-xl font-bold text-white">Tóm Tắt Đơn Hàng</h2>

      <div className="flex items-center justify-between text-sm">
        <span className="text-[#94A3B8]">Tạm tính</span>
        <span className="text-base font-mono font-bold text-white">{formatCurrency(subtotal)}</span>
      </div>

      <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
        <label htmlFor="coupon-code" className="text-xs font-mono uppercase tracking-wider text-[#566079]">
          Mã giảm giá (Thử: MMOAI10)
        </label>
        <div className="flex gap-2">
          <Input
            id="coupon-code"
            placeholder="Nhập mã ưu đãi..."
            value={couponCode}
            onChange={(event) => onCouponCodeChange(event.target.value)}
          />
          <Button type="button" variant="secondary" onClick={onApplyCoupon} className="shrink-0 px-3 sm:px-5">
            Áp dụng
          </Button>
        </div>
        {couponError && <span className="text-xs text-[#FF5C5C]" role="alert">{couponError}</span>}
        {couponSuccess && <span className="text-xs text-[#35FFB1]" role="status">{couponSuccess}</span>}
      </div>

      {discountPercent > 0 && (
        <div className="flex items-center justify-between text-sm text-[#35FFB1]">
          <span>Giảm giá ({discountPercent}%)</span>
          <span className="font-mono font-bold">-{formatCurrency(discountAmount)}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-base font-bold text-white">Tổng thanh toán</span>
        <span className="text-xl font-extrabold font-mono text-[#35FFB1] sm:text-2xl">{formatCurrency(finalTotal)}</span>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <label htmlFor="checkout-email" className="text-xs font-mono uppercase tracking-wider text-[#566079]">
          Email nhận tài khoản (*)
        </label>
        <Input
          id="checkout-email"
          type="email"
          placeholder="nhapemailcuaban@gmail.com"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
        />
      </div>

      <Button type="button" size="lg" variant="primary" onClick={onCheckout} className="mt-1 w-full">
        Tiến Hành Thanh Toán Ngay
      </Button>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-white/5 pt-3 text-xs text-[#6F7895]">
        <span>Thẻ / QR chuyển khoản</span>
        <span>Kích hoạt trong 10s</span>
      </div>
    </aside>
  );
}
