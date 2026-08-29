import { cn } from '../../common/libs/cn';

export interface CatalogFilterOption {
  key: string;
  label: string;
}

export interface ProductCatalogSidebarProps {
  categories: CatalogFilterOption[];
  selectedCategory: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string) => void;
  onReset: () => void;
  className?: string;
}

export function ProductCatalogSidebar({
  categories,
  selectedCategory,
  searchValue,
  onSearchChange,
  onCategoryChange,
  onReset,
  className,
}: ProductCatalogSidebarProps) {
  return (
    <aside
      className={cn(
        'w-full shrink-0 rounded-[14px] border border-[#26334b] bg-[#0b1020] p-4 text-[#f8fafc] shadow-[0_18px_36px_rgba(0,0,0,0.36)] lg:w-[208px]',
        className
      )}
    >
      <div className="mb-4">
        <div className="font-mono text-[10px] font-extrabold uppercase tracking-[1.8px] text-[#9ba8ff]">
          Bộ lọc / Trực tiếp
        </div>
        <h2 className="mt-2 text-[18px] font-extrabold leading-tight">Lọc sản phẩm</h2>
      </div>

      <label className="mb-4 block">
        <span className="sr-only">Tìm sản phẩm trong bộ lọc</span>
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm ChatGPT, Canva..."
          className="h-10 w-full rounded-[10px] border border-[#1d2940] bg-[#07080d] px-3 text-[12px] font-semibold text-[#f8fafc] outline-none transition-colors placeholder:text-[#657089] focus:border-[#35ffb1]/60"
        />
      </label>

      <div className="space-y-1">
        <div className="mb-2 font-mono text-[10px] font-extrabold uppercase tracking-[1.7px] text-[#9ba8ff]">
          Danh mục
        </div>
        {categories.map((category) => {
          const isActive = selectedCategory === category.key;

          return (
            <button
              key={category.key}
              type="button"
              onClick={() => onCategoryChange(category.key)}
              className={cn(
                'flex h-9 w-full items-center justify-between rounded-[9px] px-3 text-left text-[12px] font-bold transition-colors',
                isActive
                  ? 'border border-[#243451] bg-[#121a2e] text-white'
                  : 'border border-transparent text-[#7f8ba5] hover:bg-white/[0.04] hover:text-white'
              )}
            >
              <span>{category.label}</span>
              {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#35ffb1] shadow-[0_0_10px_#35ffb1]" />}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-[10px] border border-[#1d2940] bg-[#07080d] p-3">
        <div className="font-mono text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#9ba8ff]">
          Khoảng giá
        </div>
        <div className="mt-2 font-mono text-[16px] font-extrabold text-white">15k - 700k</div>
        <div className="mt-1 text-[11px] font-medium text-[#7f8ba5]">Giá niêm yết, giao ngay</div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-4 h-9 w-full rounded-[10px] border border-[#1d2940] bg-[#07080d] text-[12px] font-extrabold text-[#cbd5e1] transition-colors hover:border-[#35ffb1]/40 hover:text-white"
      >
        Đặt lại bộ lọc
      </button>
    </aside>
  );
}
