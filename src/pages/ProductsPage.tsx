import { useEffect, useMemo, useState } from 'react';
import { catalogApi } from '../common/apis/catalogApi';
import { mapProductDto } from '../common/mapping/catalog';
import type { CategoryDto } from '../common/models/catalog';
import type { Product } from '../common/models/product';
import {
  getCatalogCategoryLabel,
  getProductAccentColor,
  getProductStatusLabel,
  getProductVisualInitial,
} from '../common/libs/productCatalog';
import { useCartStore } from '../common/stores/useCartStore';
import { CatalogProductCard } from '../components/ProductCard/CatalogProductCard';
import { ProductCatalogSidebar } from '../components/ProductCatalogSidebar/ProductCatalogSidebar';

const PAGE_SIZE = 12;

const ALL_CATEGORY = 'all';

export default function ProductsPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);
  const [filterSearch, setFilterSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await catalogApi.listCategories();
        if (!cancelled) {
          setCategories(result.items);
        }
      } catch {
        // Category filter là phụ; khi lỗi vẫn hiển thị danh sách không filter.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await catalogApi.listProducts({
          page,
          pageSize: PAGE_SIZE,
          categoryId: selectedCategory !== ALL_CATEGORY ? selectedCategory : undefined,
        });
        if (cancelled) return;
        setProducts(result.items.map(mapProductDto));
        setTotalPages(result.totalPages);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, page, reloadKey]);

  // Client-side search trên trang hiện tại; backend chưa hỗ trợ keyword search.
  const visibleProducts = useMemo(() => {
    const normalized = filterSearch.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.description.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized)
    );
  }, [products, filterSearch]);

  const categoryOptions = useMemo(
    () => [
      { key: ALL_CATEGORY, label: 'Tất cả' },
      ...categories.map((category) => ({ key: category.id, label: category.name })),
    ],
    [categories]
  );

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFilterSearch('');
    setPage(1);
    setLoading(true);
    setError(null);
  };

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
    setLoading(true);
    setError(null);
  };

  const handleResetFilter = () => {
    setFilterSearch('');
    setSelectedCategory(ALL_CATEGORY);
    setPage(1);
    setLoading(true);
    setError(null);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  return (
    <div className="w-full bg-[#07080d] px-3 py-1 text-[#f8fafc] sm:px-4 lg:px-0">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 lg:flex-row lg:items-start">
        <ProductCatalogSidebar
          categories={categoryOptions}
          selectedCategory={selectedCategory}
          searchValue={filterSearch}
          onSearchChange={setFilterSearch}
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

          {loading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[12px] border border-[#243451] bg-[#0b1020] px-6 text-center">
              <div className="w-9 h-9 border-4 border-[#162033CC] border-t-[#0EA5FF] rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-[#7f8ba5]">Đang tải sản phẩm...</p>
            </div>
          ) : error ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[12px] border border-[#243451] bg-[#0b1020] px-6 text-center">
              <h2 className="text-[16px] font-extrabold text-white">Không thể tải sản phẩm</h2>
              <p className="mt-2 max-w-[360px] text-[13px] leading-6 text-[#7f8ba5]">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-4 h-9 rounded-[10px] border border-[#243451] px-4 text-[12px] font-extrabold text-[#cbd5e1] transition-colors hover:border-[#35ffb1]/40 hover:text-white"
              >
                Thử lại
              </button>
            </div>
          ) : visibleProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {visibleProducts.map((product) => (
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
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  className={
                    page === pageNumber
                      ? 'h-9 w-9 rounded-[10px] border border-[#243451] bg-[#121a2e] text-[13px] font-extrabold text-white'
                      : 'h-9 w-9 rounded-[10px] border border-[#1d2940] bg-[#07080d] text-[13px] font-extrabold text-[#7f8ba5] transition-colors hover:text-white'
                  }
                >
                  {pageNumber}
                </button>
              ))}
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}
