import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../common/stores/useCartStore';
import { formatCurrency } from '../common/libs/formatter';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { Chip } from '../components/Chip/Chip';
import { APP_CONSTANTS } from '../common/const/app';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice, getTotalItems } =
    useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [email, setEmail] = useState('');

  const subtotal = getTotalPrice();
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }
    if (couponCode.trim().toUpperCase() === 'MMOAI10') {
      setDiscountPercent(10);
      setCouponSuccess('Áp dụng mã giảm giá 10% thành công!');
    } else {
      setCouponError('Mã giảm giá không hợp lệ hoặc đã hết hạn');
    }
  };

  const handleCheckout = () => {
    if (!email.trim() || !email.includes('@')) {
      alert('Vui lòng nhập email hợp lệ để nhận thông tin tài khoản!');
      return;
    }
    alert(`Thanh toán đơn hàng thành công! Thông tin tài khoản đã được gửi tới ${email}.`);
    clearCart();
  };

  return (
    <div className="w-full max-w-[1440px] px-6 md:px-[96px] py-[60px] flex flex-col gap-10 relative">
      {/* Background Glows */}
      <div className="absolute w-[600px] h-[600px] bg-[#008CFF]/10 rounded-full blur-[140px] pointer-events-none top-0 left-1/4 -z-10" />
      <div className="absolute w-[500px] h-[500px] bg-[#7B2CFF]/10 rounded-full blur-[140px] pointer-events-none top-96 right-10 -z-10" />

      {/* Page Title */}
      <div className="flex flex-col gap-2">
        <Chip status="online">Quản Lý Đơn Hàng</Chip>
        <h1 className="text-3xl md:text-[38px] font-bold text-white tracking-tight">
          Giỏ Hàng Của Bạn ({getTotalItems()})
        </h1>
      </div>

      {items.length > 0 ? (
        /* Cart Main Layout (2 Columns) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono text-[#566079] uppercase tracking-wider">
                DANH SÁCH SẢN PHẨM ({items.length})
              </span>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-[#94A3B8] hover:text-[#FF5C5C] transition-colors font-medium cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>

            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-[20px] bg-[#0C101CEE] border border-white/10 shadow-[0_14px_28px_rgba(0,0,0,0.35)] hover:border-white/20 transition-all"
              >
                {/* Product Meta */}
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-black/40 shrink-0"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono font-bold text-[#0EA5FF] uppercase">
                      {product.category}
                    </span>
                    <Link
                      to={`/products/${product.id}`}
                      className="text-base font-bold text-white hover:text-[#0EA5FF] transition-colors line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <span className="text-sm font-mono text-[#94A3B8]">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </div>

                {/* Quantity & Subtotal Action */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="flex items-center bg-black/40 border border-white/10 rounded-[12px] p-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/10 rounded-md font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-white text-sm">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/10 rounded-md font-bold text-sm"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold font-mono text-white">
                      {formatCurrency(product.price * quantity)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#566079] hover:text-[#FF5C5C] hover:bg-white/5 transition-colors cursor-pointer"
                    title="Xóa sản phẩm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link to={APP_CONSTANTS.ROUTES.PRODUCTS}>
                <Button variant="ghost" size="sm">
                  &larr; Tiếp tục chọn thêm sản phẩm
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout Panel */}
          <div className="lg:col-span-5 rounded-[24px] bg-[#0C101CEE] border border-[#7887BE33] p-8 backdrop-blur-[18px] shadow-[0_18px_38px_rgba(0,0,0,0.6)] flex flex-col gap-6 sticky top-24">
            <h3 className="text-xl font-bold text-white pb-3 border-b border-white/10">
              Tóm Tắt Đơn Hàng
            </h3>

            {/* Subtotal */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#94A3B8]">Tạm tính</span>
              <span className="font-mono font-bold text-white text-base">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {/* Coupon Section */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
              <label className="text-xs font-mono text-[#566079] uppercase tracking-wider">
                MÃ GIẢM GIÁ (Thử: MMOAI10)
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập mã ưu đãi..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button variant="secondary" onClick={handleApplyCoupon} className="shrink-0">
                  Áp dụng
                </Button>
              </div>
              {couponError && <span className="text-xs text-[#FF5C5C]">{couponError}</span>}
              {couponSuccess && <span className="text-xs text-[#35FFB1]">{couponSuccess}</span>}
            </div>

            {/* Discount Row */}
            {discountPercent > 0 && (
              <div className="flex justify-between items-center text-sm text-[#35FFB1]">
                <span>Giảm giá ({discountPercent}%)</span>
                <span className="font-mono font-bold">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            )}

            {/* Final Total */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <span className="text-base font-bold text-white">Tổng thanh toán</span>
              <span className="text-2xl font-extrabold font-mono text-[#35FFB1]">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            {/* Customer Email Input */}
            <div className="flex flex-col gap-2 pt-2">
              <label className="text-xs font-mono text-[#566079] uppercase tracking-wider">
                EMAIL NHẬN TÀI KHOẢN (*)
              </label>
              <Input
                type="email"
                placeholder="nhapemailcuaban@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Checkout Button */}
            <Button size="lg" variant="primary" onClick={handleCheckout} className="w-full mt-2">
              Tiến Hành Thanh Toán Ngay
            </Button>

            {/* Payment Method Badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-[#6F7895] pt-2 border-t border-white/5">
              <span>💳 Mã QR Chuyển Khoản</span>
              <span>⚡ Kích Hoạt 10s</span>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Cart State */
        <div className="flex flex-col items-center justify-center py-20 rounded-[24px] bg-[#0C101CEE] border border-white/10 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[#94A3B8] text-2xl">
            🛒
          </div>
          <h2 className="text-2xl font-bold text-white">Giỏ hàng của bạn đang trống</h2>
          <p className="text-sm text-[#94A3B8] max-w-md">
            Chưa có tài khoản AI nào được thêm vào giỏ hàng. Hãy khám phá danh sách các tài khoản AI chất lượng cao ngay!
          </p>
          <Link to={APP_CONSTANTS.ROUTES.PRODUCTS} className="mt-2">
            <Button size="lg" variant="primary">
              Khám Phá Sản Phẩm Ngay
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
