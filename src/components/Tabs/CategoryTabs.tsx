import { cn } from '../../common/libs/cn';


export interface CategoryOption {
  key: string;
  label: string;
}

export interface CategoryTabsProps {
  categories: CategoryOption[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export function CategoryTabs({
  categories,
  activeKey,
  onChange,
  className,
}: CategoryTabsProps) {
  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {categories.map((cat) => {
        const isActive = cat.key === activeKey;
        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => onChange(cat.key)}
            className={cn(
              'px-4 py-2 rounded-[18px] text-[13px] transition-all duration-200 cursor-pointer font-medium select-none',
              isActive
                ? 'bg-[#162033CC] text-[#F8FAFC] font-bold shadow-sm border border-[#0EA5FF]/30'
                : 'bg-transparent text-[#94A3B8] hover:text-[#DCE4F8] hover:bg-white/5 border border-transparent'
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
