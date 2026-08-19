import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../common/mocks/products';
import { formatCurrency } from '../common/libs/formatter';
import { useCartStore } from '../common/stores/useCartStore';

const CATEGORIES = [
  { key: 'all', label: 'Tất cả' },
  { key: 'chatgpt', label: 'ChatGPT' },
  { key: 'canva', label: 'Canva' },
  { key: 'gemini', label: 'Gemini' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'office', label: 'Office' },
  { key: 'claude', label: 'Claude' },
  { key: 'capcut', label: 'CapCut' },
  { key: 'turnitin', label: 'Turnitin' },
  { key: 'netflix', label: 'Netflix' },
];

export default function ProductsPage() {
  const [globalSearch, setGlobalSearch] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');
  const [currentPage, setCurrentPage] = useState(1);

  const addToCart = useCartStore((state) => state.addToCart);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((prod) => {
      // Category filter
      const matchCat = selectedCat === 'all' || prod.category === selectedCat;
      // Global header search
      const matchGlobal =
        !globalSearch ||
        prod.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        prod.description.toLowerCase().includes(globalSearch.toLowerCase());
      // Sidebar internal filter search
      const matchSidebar =
        !filterSearch ||
        prod.name.toLowerCase().includes(filterSearch.toLowerCase());

      return matchCat && matchGlobal && matchSidebar;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });
  }, [selectedCat, globalSearch, filterSearch, sortBy]);

  const handleResetFilter = () => {
    setGlobalSearch('');
    setFilterSearch('');
    setSelectedCat('all');
    setSortBy('popular');
  };

  return (
    <div className="w-full max-w-[1440px] flex flex-col bg-[#07080D] relative text-[#F8FAFC] overflow-hidden">
      
      {/* 4. Header Slot (Width: 1440px, Height: 210px) */}
      <div className="w-full h-[210px] bg-[#07080D] relative flex items-center px-6 lg:px-[96px]">
        {/* Decorative Header Glows */}
        {/* Violet Aura */}
        <div className="absolute w-[520px] h-[160px] bg-[#7C3AED66] rounded-full blur-[38px] opacity-42 pointer-events-none top-0 left-[40%]" />
        {/* Cyan Aura */}
        <div className="absolute w-[360px] h-[140px] bg-[#06B6D455] rounded-full blur-[42px] opacity-36 pointer-events-none top-[10px] left-[65%]" />
        {/* Blue Neon Streak */}
        <div className="absolute w-[760px] h-[5px] bg-[#2563EB66] blur-[28px] rounded-[4px] -rotate-4 top-[38px] left-[104px] pointer-events-none" />
        {/* Violet Neon Streak */}
        <div className="absolute w-[520px] h-[4px] bg-[#A855F766] blur-[32px] rounded-[4px] rotate-6 top-[142px] left-[50%] pointer-events-none" />

        <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 z-10">
          {/* Header Title */}
          <h1 className="font-geist text-3xl md:text-[38px] font-semibold text-[#F8FAFC] tracking-[-0.8px]">
            Danh mục sản phẩm
          </h1>

          {/* Search Bar (462px x 52px) */}
          <div className="w-full lg:w-[462px] h-[52px] bg-[#0B1020DD] border border-[#2B3A55] rounded-[18px] backdrop-blur-[16px] shadow-[0_16px_34px_#00000066] flex items-center gap-3 px-4">
            <span className="font-mono text-[18px] text-[#93A4BE] select-none">⌕</span>
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Tìm sản phẩm, cấu hình hoặc kiểu giao hàng"
              className="flex-1 bg-transparent border-none outline-none font-sans text-sm text-[#F8FAFC] placeholder-[#718096]"
            />
            <span className="bg-[#111827] border border-[#334155] rounded-[8px] px-2 py-1 font-mono text-[11px] text-[#CBD5E1] select-none">
              ⌘K
            </span>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="absolute bottom-0 left-[96px] right-[96px] h-px bg-[#26354C]" />
      </div>

      {/* 7. Body: Product Catalog (Width: full, Padding: 96px) */}
      <div className="w-full px-6 lg:px-[96px] py-8 bg-[#07080D] flex flex-col lg:flex-row gap-[24px] items-start">
        
        {/* 8. Sidebar Filter (280px) */}
        <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-[18px]">
          <div className="w-full rounded-[18px] bg-[#0C101CEE] border border-[#7887BE2A] p-5 flex flex-col gap-[18px] backdrop-blur-[18px]">
            
            {/* Filter Header */}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[11px] font-extrabold tracking-[1.1px] text-[#35FFB1] uppercase">
                BỘ LỌC
              </span>
              <h3 className="font-sans text-base font-extrabold text-[#F8FAFC]">
                Tinh chỉnh danh mục
              </h3>
              <p className="text-[12px] text-[#8D94AA]">
                Chọn danh mục hoặc tìm kiếm để lọc sản phẩm.
              </p>
            </div>

            {/* Sidebar Search */}
            <div className="w-full h-11 bg-[#07080D] border border-[#7887BE33] rounded-[13px] px-[14px] flex items-center gap-2">
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Tìm trong bộ lọc"
                className="w-full bg-transparent border-none outline-none text-[13px] text-[#F8FAFC] placeholder-[#64748B]"
              />
            </div>

            {/* Category Group */}
            <div className="flex flex-col gap-[10px]">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCat === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCat(cat.key)}
                    className={`w-full h-10 px-[14px] rounded-[13px] text-[13px] font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-[#162033CC] border border-[#7887BE33] text-[#F8FAFC]'
                        : 'bg-[#07080D99] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#35FFB1]" />}
                  </button>
                );
              })}
            </div>

            {/* Price Range Card */}
            <div className="w-full h-[98px] bg-[#07080D] border border-[#7887BE22] rounded-[14px] p-[14px] flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[11px] font-bold text-[#566079] uppercase">
                  KHOẢNG GIÁ
                </span>
                <span className="font-sans text-[18px] font-extrabold text-[#F2F4FF]">
                  20K – 299K
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#101521E6] overflow-hidden p-0.5">
                <div className="w-3/4 h-full rounded-full bg-gradient-to-r from-[#21D4FD] to-[#8A2EFF]" />
              </div>
            </div>

            {/* Reset Filter Button */}
            <button
              type="button"
              onClick={handleResetFilter}
              className="w-full h-8 bg-[#07080D99] border border-[#7887BE33] rounded-[14px] text-[12px] font-bold text-[#DCE4F8] hover:bg-white/5 transition-colors cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </aside>

        {/* 9. Product Catalog Grid (Width: 944px / flex-1) */}
        <main className="flex-1 w-full flex flex-col gap-[18px]">
          {/* Product Grid Header */}
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div className="flex flex-col gap-[5px]">
              <span className="font-mono text-[11px] font-extrabold tracking-[1.1px] text-[#35FFB1] uppercase">
                DANH MỤC TÀI KHOẢN
              </span>
              <h2 className="font-geist text-2xl md:text-[30px] font-semibold text-[#F8FAFC]">
                Sản phẩm nổi bật
              </h2>
              <p className="text-[13px] text-[#8D94AA]">
                Chọn gói phù hợp, xem trạng thái online và thêm nhanh vào giỏ.
              </p>
            </div>

            {/* Sort Control Dropdown */}
            <select
              aria-label="Sắp xếp sản phẩm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-11 bg-[#0C101CEE] border border-white/14 rounded-[14px] px-[14px] text-[13px] text-[#DCE4F8] outline-none cursor-pointer hover:border-white/20 transition-all font-medium self-start sm:self-auto"
            >
              <option value="popular">Nổi bật nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
            </select>
          </div>

          {/* Product Cards Area (3 per row) */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-[18px] bg-[#0C101CEE] border border-white/14 p-[16px] flex flex-col justify-between gap-[14px] shadow-[0_14px_28px_#00000055] hover:border-white/20 transition-all group"
                >
                  {/* Top Row: Name + Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/products/${prod.id}`}
                      className="font-sans text-[16px] font-extrabold text-[#F8FAFC] hover:text-[#0EA5FF] transition-colors line-clamp-1"
                    >
                      {prod.name}
                    </Link>
                    <span className="bg-[#101521E6] rounded-full px-[10px] py-[6px] font-mono text-[10px] font-extrabold text-[#2DD4BF] tracking-wider uppercase shrink-0">
                      ONLINE
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[13px] text-[#94A3B8] leading-[1.45] line-clamp-2">
                    {prod.description}
                  </p>

                  {/* Meta Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {prod.metaTags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#07080D] border border-white/14 px-2 py-0.5 font-mono text-[10px] text-[#8D94AA]"
                      >
                        {tag}
                      </span>
                    )) || (
                      <span className="rounded-full bg-[#07080D] border border-white/14 px-2 py-0.5 font-mono text-[10px] text-[#8D94AA]">
                        {prod.category}
                      </span>
                    )}
                  </div>

                  {/* Bottom Row: Price + Add Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                    <span className="font-mono text-[16px] font-extrabold text-white">
                      {formatCurrency(prod.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(prod);
                        alert(`Đã thêm ${prod.name} vào giỏ hàng!`);
                      }}
                      className="rounded-[14px] bg-gradient-to-r from-[#0EA5FF] to-[#7C3DFF] px-4 py-2 text-[13px] font-bold text-white shadow-[0_8px_24px_#4E64FF66] hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="w-full py-16 rounded-[18px] bg-[#0C101CEE] border border-white/10 flex flex-col items-center justify-center gap-3 text-center">
              <span className="text-2xl">🔍</span>
              <h3 className="text-base font-bold text-white">Không có sản phẩm nào phù hợp</h3>
              <p className="text-xs text-[#8D94AA]">Thử thay đổi từ khóa hoặc đặt lại bộ lọc danh mục.</p>
              <button
                type="button"
                onClick={handleResetFilter}
                className="mt-2 text-xs font-bold text-[#0EA5FF] underline"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}

          {/* 9. Pagination */}
          <div className="w-full h-[48px] flex items-center justify-center gap-[10px] pt-4">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-[12px] border text-[13px] font-bold transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#162033CC] border-[#7887BE33] text-white shadow-sm'
                    : 'bg-[#07080D] border-[#7887BE33] text-[#8D94AA] hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
              className="px-3 h-9 rounded-[12px] bg-[#07080D] border border-[#7887BE33] text-[13px] font-bold text-[#8D94AA] hover:text-white transition-colors cursor-pointer"
            >
              Tiếp &gt;
            </button>
          </div>
        </main>

      </div>
    </div>
  );
}
