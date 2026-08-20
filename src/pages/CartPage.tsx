import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../common/stores/useCartStore';
import { Button } from '../components/Button/Button';
import { Chip } from '../components/Chip/Chip';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { PageContainer } from '../components/PageContainer/PageContainer';
import { CartLineItem } from '../components/CartLineItem/CartLineItem';
import { OrderSummary } from '../components/OrderSummary/OrderSummary';
import { APP_CONSTANTS } from '../common/const/app';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice, getTotalItems } = useCartStore();
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
      return;
    }
    setDiscountPercent(0);
    setCouponError('Mã giảm giá không hợp lệ hoặc đã hết hạn');
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
    <PageContainer className="flex flex-col gap-8 sm:gap-10">
      <header className="flex flex-col items-start gap-2">
        <Chip status="online">Quản Lý Đơn Hàng</Chip>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-[38px]">Giỏ Hàng Của Bạn ({getTotalItems()})</h1>
      </header>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <section className="flex flex-col gap-4 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#566079]">Danh sách sản phẩm ({items.length})</span>
              <button type="button" onClick={clearCart} className="text-xs font-medium text-[#94A3B8] transition-colors hover:text-[#FF5C5C]">Xóa tất cả</button>
            </div>

            {items.map(({ product, quantity }) => (
              <CartLineItem key={product.id} product={product} quantity={quantity} onQuantityChange={(nextQuantity) => updateQuantity(product.id, nextQuantity)} onRemove={() => removeFromCart(product.id)} />
            ))}

            <Link to={APP_CONSTANTS.ROUTES.PRODUCTS} className="self-start">
              <Button type="button" variant="ghost" size="sm">← Tiếp tục chọn thêm sản phẩm</Button>
            </Link>
          </section>

          <OrderSummary
            subtotal={subtotal}
            discountPercent={discountPercent}
            discountAmount={discountAmount}
            finalTotal={finalTotal}
            couponCode={couponCode}
            couponError={couponError}
            couponSuccess={couponSuccess}
            email={email}
            onCouponCodeChange={setCouponCode}
            onApplyCoupon={handleApplyCoupon}
            onEmailChange={setEmail}
            onCheckout={handleCheckout}
          />
        </div>
      ) : (
        <EmptyState
          icon={<CartIcon />}
          title="Giỏ hàng của bạn đang trống"
          description="Chưa có tài khoản AI nào được thêm vào giỏ hàng. Hãy khám phá danh sách các tài khoản AI chất lượng cao ngay!"
          action={<Link to={APP_CONSTANTS.ROUTES.PRODUCTS}><Button type="button" size="lg" variant="primary">Khám Phá Sản Phẩm Ngay</Button></Link>}
        />
      )}
    </PageContainer>
  );
}

function CartIcon() {
  return <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1" /><circle cx="19" cy="20" r="1" /><path d="M2 3h2l2.4 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L21 7H5" /></svg>;
}
