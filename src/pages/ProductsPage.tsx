import { MOCK_PRODUCTS } from '../common/mocks/products';
import { ProductCard } from '../components/ProductCard/ProductCard';
import { Button } from '../components/Button/Button';
import { Chip } from '../components/Chip/Chip';
import { useCartStore } from '../common/stores/useCartStore';

export default function ProductsPage() {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <div className="w-full max-w-[1440px] px-6 md:px-[96px] py-[72px] flex flex-col gap-[80px] relative">
      {/* Glow Effects */}
      <div className="absolute w-[600px] h-[600px] bg-[#008CFF]/15 rounded-full blur-[140px] pointer-events-none top-0 left-1/4 -z-10" />
      <div className="absolute w-[500px] h-[500px] bg-[#7B2CFF]/15 rounded-full blur-[140px] pointer-events-none top-96 right-10 -z-10" />

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-12 pt-8">
        {/* Left Column */}
        <div className="flex-1 flex flex-col items-start gap-6">
          <Chip status="online">Hệ sinh thái AI 2026</Chip>

          <h1 className="text-4xl md:text-[58px] font-bold text-white leading-[1.1] tracking-tight">
            Chợ Tài Khoản AI <br />
            <span className="bg-gradient-to-r from-[#0EA5FF] to-[#7C3DFF] bg-clip-text text-transparent">
              Tự Động & Uy Tín
            </span>
          </h1>

          <p className="text-[#94A3B8] text-base md:text-lg max-w-xl leading-relaxed">
            Cung cấp tài khoản ChatGPT Plus, Claude 3.5 Sonnet, Midjourney & Copilot bản quyền giá tốt nhất. Kích hoạt tức thì 24/7.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <Button size="lg" variant="primary">
              Khám Phá Ngay
            </Button>
            <Button size="lg" variant="secondary">
              Xem Chính Sách
            </Button>
          </div>
        </div>

        {/* Right Column: Hero Graphic / Stat Card */}
        <div className="w-full md:w-[480px] rounded-[24px] bg-[#0C101CEE] border border-[#7887BE33] p-8 backdrop-blur-[18px] shadow-[0_18px_38px_rgba(0,0,0,0.6)] flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="font-mono text-xs text-[#566079] tracking-wider uppercase">
              TỔNG QUAN TÀI KHOẢN
            </span>
            <Chip status="online">Trực tuyến</Chip>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="text-xs text-[#94A3B8]">Tài khoản sẵn sàng</div>
              <div className="text-2xl font-bold font-mono text-[#35FFB1] mt-1">1,240+</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="text-xs text-[#94A3B8]">Đánh giá tích cực</div>
              <div className="text-2xl font-bold font-mono text-[#0EA5FF] mt-1">99.8%</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-[#0EA5FF]/10 to-[#7C3DFF]/10 border border-[#0EA5FF]/20 text-xs text-[#DCE4F8] leading-relaxed">
            ⚡ Hệ thống kích hoạt tự động qua email chỉ trong 10 giây sau khi thanh toán thành công.
          </div>
        </div>
      </section>

      {/* Main Product Showcase Section */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-[#35FFB1] tracking-wider uppercase">
            DANH MỤC SẢN PHẨM
          </span>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Tài Khoản AI Nổi Bật
          </h2>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(p) => {
                addToCart(p);
                alert(`Đã thêm ${p.name} vào giỏ hàng!`);
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
