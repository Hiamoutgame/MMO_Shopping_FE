import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { catalogApi } from '../common/apis/catalogApi';
import { shoppingApi } from '../common/apis/shoppingApi';
import { mapProductDto } from '../common/mapping/catalog';
import type { Product, ProductVariant } from '../common/models/product';
import { formatCurrency } from '../common/libs/formatter';
import { useAuthStore } from '../common/stores/useAuthStore';
import { Button } from '../components/Button/Button';
import { Chip } from '../components/Chip/Chip';
import { InfoCard } from '../components/InfoCard/InfoCard';
import { useCartStore } from '../common/stores/useCartStore';
import { APP_CONSTANTS } from '../common/const/app';

const SESSION_ID_KEY = 'mmo_anonymous_session_id';

function getAnonymousSessionId(): string {
  let sessionId = window.sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'policy'>('desc');

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const viewRecordedRef = useRef(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await catalogApi.getProduct(id);
        if (cancelled) return;
        const mapped = mapProductDto(result.product);
        setProduct(mapped);
        setSelectedVariantId(mapped.variants?.[0]?.id ?? null);
        setNotFound(false);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const apiError = err as { status?: number | null };
        if (apiError.status === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  // Record product view đúng một lần cho mỗi lần mở detail hợp lệ.
  useEffect(() => {
    if (!id || !product || viewRecordedRef.current) return;
    viewRecordedRef.current = true;

    const payload: { productId: string; sessionId?: string } = { productId: id };
    if (!isAuthenticated) {
      payload.sessionId = getAnonymousSessionId();
    }

    shoppingApi.recordProductView(payload).catch(() => {
      // View tracking failure không chặn việc xem product detail.
    });
  }, [id, product, isAuthenticated]);

  const productVariants = useMemo<ProductVariant[]>(
    () => product?.variants ?? [],
    [product]
  );

  const selectedVariant = useMemo(
    () => productVariants.find((variant) => variant.id === selectedVariantId) ?? null,
    [productVariants, selectedVariantId]
  );

  const displayPrice = selectedVariant?.price ?? product?.price ?? '0';

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!product) return;
    // GĐ3 sẽ chuyển add-to-cart sang POST /cart/items với productVariantId.
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate(APP_CONSTANTS.ROUTES.CART);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    setReloadKey((key) => key + 1);
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1440px] px-6 md:px-[96px] py-[48px] flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-9 h-9 border-4 border-[#162033CC] border-t-[#0EA5FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-[#94A3B8]">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="w-full max-w-[1440px] px-6 md:px-[96px] py-[48px] flex items-center justify-center min-h-[400px]">
        <div className="text-center flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Không tìm thấy sản phẩm</h1>
          <p className="text-[#94A3B8]">Sản phẩm không tồn tại hoặc đã ngừng bán.</p>
          <Link to={APP_CONSTANTS.ROUTES.PRODUCTS}>
            <Button type="button" variant="primary" size="lg">Quay lại danh sách sản phẩm</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[1440px] px-6 md:px-[96px] py-[48px] flex items-center justify-center min-h-[400px]">
        <div className="text-center flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Không thể tải sản phẩm</h1>
          <p className="text-[#94A3B8]">{error}</p>
          <Button type="button" variant="primary" size="lg" onClick={handleRetry}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] px-6 md:px-[96px] py-[48px] flex flex-col gap-12 relative">
      {/* Glow Effects */}
      <div className="absolute w-[600px] h-[600px] bg-[#008CFF]/10 rounded-full blur-[140px] pointer-events-none top-0 left-1/4 -z-10" />
      <div className="absolute w-[500px] h-[500px] bg-[#7B2CFF]/10 rounded-full blur-[140px] pointer-events-none top-[400px] right-10 -z-10" />

      {/* Breadcrumb / Back Link */}
      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
        <Link to={APP_CONSTANTS.ROUTES.PRODUCTS} className="hover:text-[#0EA5FF] transition-colors flex items-center gap-1 font-medium">
          &larr; Quay lại danh sách sản phẩm
        </Link>
        <span>/</span>
        <span className="text-[#F8FAFC] font-semibold">{product.name}</span>
      </div>

      {/* Main Detail Section (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Image & Feature Checklist */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="relative aspect-video lg:aspect-square w-full rounded-[24px] overflow-hidden bg-black/50 border border-white/10 shadow-[0_18px_38px_rgba(0,0,0,0.5)]">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#566079] font-mono text-sm">NO IMAGE</div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <Chip status={product.status}>
                {product.status === 'online' ? 'Trực tuyến 24/7' : 'Tạm hết hàng'}
              </Chip>
            </div>
          </div>

          {/* Quick Features List */}
          <div className="p-6 rounded-[20px] bg-[#0C101CEE] border border-white/10 flex flex-col gap-3">
            <h4 className="text-xs font-mono font-bold text-[#566079] uppercase tracking-wider">
              ĐẶC ĐIỂM SẢN PHẨM
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-[#DCE4F8]">
              <li className="flex items-center gap-2">
                <span className="text-[#35FFB1]">✓</span> Kích hoạt tự động qua Email chỉ 10s
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#35FFB1]">✓</span> Bảo hành 1 đổi 1 trong toàn bộ thời gian sử dụng
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#35FFB1]">✓</span> Không giới hạn băng thông & tốc độ tối đa
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#35FFB1]">✓</span> Hỗ trợ kỹ thuật trực tiếp 24/7
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Title, Price, Quantity & Actions */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#101521E6] border border-[#0EA5FF]/30 text-xs font-mono font-semibold text-[#0EA5FF] uppercase">
                {product.category || 'Sản phẩm'}
              </span>
            </div>
            {productVariants.length > 1 && (
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[#DCE4F8]">Chọn gói sản phẩm</span>
                  <span className="text-xs text-[#566079]">{productVariants.length} lựa chọn</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {productVariants.map((variant) => {
                    const isSelected = variant.id === selectedVariantId;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleVariantChange(variant.id)}
                        className={`flex min-h-16 flex-col items-start justify-center rounded-xl border px-4 py-3 text-left transition-colors ${isSelected ? 'border-[#0EA5FF] bg-[#0EA5FF]/10' : 'border-white/10 bg-[#0C101CEE] hover:border-white/25'}`}
                      >
                        <span className={`text-sm font-bold ${isSelected ? 'text-[#F8FAFC]' : 'text-[#DCE4F8]'}`}>
                          {variant.name || product.name}
                        </span>
                        <span className="mt-1 text-xs font-mono text-[#94A3B8]">{formatCurrency(variant.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <h1 className="text-3xl md:text-[38px] font-bold text-white tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-[#94A3B8] text-base leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price Box */}
          <div className="p-6 rounded-[20px] bg-[#0C101CEE] border border-[#7887BE33] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-[#566079] font-mono uppercase tracking-wider">GIÁ BÁN NIÊM YẾT</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl md:text-4xl font-extrabold font-mono text-white">
                  {formatCurrency(displayPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Quantity Selector & Actions */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#94A3B8] font-medium">Số lượng:</span>
              <div className="flex items-center bg-[#0C101CEE] border border-white/10 rounded-[14px] p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/5 rounded-lg font-bold text-lg"
                >
                  -
                </button>
                <span className="w-12 text-center font-mono font-bold text-white text-base">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/5 rounded-lg font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Button size="lg" variant="secondary" onClick={handleAddToCart}>
                Thêm Vào Giỏ Hàng
              </Button>
              <Button size="lg" variant="primary" onClick={handleBuyNow}>
                Mua Ngay
              </Button>
            </div>
          </div>

          {/* Service Commitments List (InfoCard) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-white/5">
            <InfoCard label="BẢO HÀNH" title="1 Đổi 1" desc="Hỗ trợ ngay lập tức" icon={<span>🛡️</span>} />
            <InfoCard label="TỐC ĐỘ" title="10 Giây" desc="Kích hoạt tự động" icon={<span>⚡</span>} />
            <InfoCard label="HỖ TRỢ" title="24/7 Online" desc="Kỹ thuật chuyên sâu" icon={<span>💬</span>} />
          </div>
        </div>
      </div>

      {/* Tabs Detail Section */}
      <div className="flex flex-col gap-6 pt-8 border-t border-white/10">
        <div className="flex gap-4 border-b border-white/10 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('desc')}
            className={`text-base font-bold pb-2 transition-colors cursor-pointer ${activeTab === 'desc' ? 'text-[#0EA5FF] border-b-2 border-[#0EA5FF]' : 'text-[#94A3B8] hover:text-white'}`}
          >
            Mô Tả & Hướng Dẫn Sử Dụng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('policy')}
            className={`text-base font-bold pb-2 transition-colors cursor-pointer ${activeTab === 'policy' ? 'text-[#0EA5FF] border-b-2 border-[#0EA5FF]' : 'text-[#94A3B8] hover:text-white'}`}
          >
            Chính Sách Bảo Hành
          </button>
        </div>

        <div className="p-8 rounded-[24px] bg-[#0C101CEE] border border-[#7887BE33] leading-relaxed text-[#C8D2EA]">
          {activeTab === 'desc' ? (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white">Giới thiệu {product.name}</h3>
              <p>
                Đây là tài khoản bản quyền cao cấp dành cho cá nhân và doanh nghiệp có nhu cầu khai thác tối đa sức mạnh của AI trong công việc tạo nội dung, lập trình, và thiết kế đồ họa.
              </p>
              <h4 className="text-md font-bold text-white mt-2">Quy trình nhận tài khoản:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-[#94A3B8]">
                <li>Thực hiện thanh toán đơn hàng thành công qua mã QR.</li>
                <li>Hệ thống gửi thông tin đăng nhập bao gồm Email, Mật khẩu và mã Backup khôi phục.</li>
                <li>Đăng nhập trực tiếp và bắt đầu sử dụng dịch vụ không giới hạn.</li>
              </ol>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white">Cam Kết Bảo Hành 100%</h3>
              <p>
                Tất cả sản phẩm tài khoản tại Chợ Tài Khoản AI đều được áp dụng chính sách bảo hành 1 đổi 1 trong suốt thời gian đăng ký gói.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-[#94A3B8]">
                <li>Đổi tài khoản mới trong vòng 15 phút nếu có lỗi đăng nhập do nhà cung cấp.</li>
                <li>Hoàn tiền 100% nếu không thể khắc phục sự cố trong quá trình sử dụng.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      {product.variants && product.variants.length > 1 && (
        <div className="flex flex-col gap-6 pt-6">
          <h2 className="text-2xl font-bold text-white">Các gói khác</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.variants.slice(0, 3).map((variant) => (
              <VariantCard key={variant.id} variant={variant} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VariantCard({ variant }: { variant: ProductVariant }) {
  return (
    <div className="rounded-[18px] bg-[#0C101CEE] border border-white/10 p-5 flex flex-col gap-2">
      <span className="text-sm font-bold text-[#F8FAFC]">{variant.name}</span>
      <span className="text-lg font-extrabold font-mono text-white">{formatCurrency(variant.price)}</span>
      <span className="text-xs text-[#566079]">
        {variant.availableQuantity > 0 ? `Còn ${variant.availableQuantity}` : 'Hết hàng'}
      </span>
    </div>
  );
}
