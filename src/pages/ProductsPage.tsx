import { useMemo, useState } from 'react';
import { MOCK_PRODUCTS } from '../common/mocks/products';
import {
  CATALOG_CATEGORIES,
  type CatalogCategoryKey,
  getCatalogCategoryLabel,
  getProductAccentColor,
  getProductStatusLabel,
  getProductVisualInitial,
  isProductInCatalogCategory,
} from '../common/libs/productCatalog';
import { useCartStore } from '../common/stores/useCartStore';
import { CatalogProductCard } from '../components/ProductCard/CatalogProductCard';
import { ProductCatalogSidebar } from '../components/ProductCatalogSidebar/ProductCatalogSidebar';

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<CatalogCategoryKey>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const addToCart = useCartStore((state) => state.addToCart);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = filterSearch.trim().toLowerCase();

    return MOCK_PRODUCTS.filter((product) => {
      const matchesCategory = isProductInCatalogCategory(product, selectedCat);
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch) ||
        product.metaTags?.some((tag) => tag.toLowerCase().includes(normalizedSearch));

      return matchesCategory && matchesSearch;
    });
  }, [filterSearch, selectedCat]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const pageProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (category: CatalogCategoryKey) => {
    setSelectedCat(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setFilterSearch(value);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setFilterSearch('');
    setSelectedCat('all');
    setCurrentPage(1);
  };

  return (
    <div className="w-full bg-[#07080d] px-3 py-1 text-[#f8fafc] sm:px-4 lg:px-0">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 lg:flex-row lg:items-start">
        <ProductCatalogSidebar
          categories={CATALOG_CATEGORIES}
          selectedCategory={selectedCat}
          searchValue={filterSearch}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onReset={handleResetFilter}
        />

        <main className="min-w-0 flex-1 rounded-[14px] border border-[#151d2d] bg-[#07080d] px-0 pb-6 lg:border-transparent">
          <header className="mb-4 flex flex-col gap-1 px-0 pt-2">
            <div className="font-mono text-[10px] font-extrabold uppercase tracking-[1.8px] text-[#9ba8ff]">
              Danh mục / Kho trực tiếp
            </div>
            <h1 className="text-[20px] font-extrabold leading-tight text-white sm:text-[22px]">
              Danh sách sản phẩm giao ngay
            </h1>
          </header>

          {pageProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {pageProducts.map((product) => (
                <CatalogProductCard
                  key={product.id}
                  product={product}
                  categoryLabel={getCatalogCategoryLabel(product)}
                  visualInitial={getProductVisualInitial(product)}
                  accentColor={getProductAccentColor(product)}
                  statusLabel={getProductStatusLabel(product)}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[12px] border border-[#243451] bg-[#0b1020] px-6 text-center">
              <h2 className="text-[16px] font-extrabold text-white">Không có sản phẩm phù hợp</h2>
              <p className="mt-2 max-w-[360px] text-[13px] leading-6 text-[#7f8ba5]">
                Thử đổi từ khóa hoặc đặt lại bộ lọc để xem toàn bộ kho sản phẩm.
              </p>
              <button
                type="button"
                onClick={handleResetFilter}
                className="mt-4 h-9 rounded-[10px] border border-[#243451] px-4 text-[12px] font-extrabold text-[#cbd5e1] transition-colors hover:border-[#35ffb1]/40 hover:text-white"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-5 flex items-center justify-center gap-2" aria-label="Phân trang sản phẩm">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page
                      ? 'h-9 w-9 rounded-[10px] border border-[#243451] bg-[#121a2e] text-[13px] font-extrabold text-white'
                      : 'h-9 w-9 rounded-[10px] border border-[#1d2940] bg-[#07080d] text-[13px] font-extrabold text-[#7f8ba5] transition-colors hover:text-white'
                  }
                >
                  {page}
                </button>
              ))}
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}
