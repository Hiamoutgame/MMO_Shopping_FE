import { Link } from 'react-router-dom';
import type { Product } from '../../common/models/product';
import { formatCurrency } from '../../common/libs/formatter';
import { cn } from '../../common/libs/cn';

export interface CatalogProductCardProps {
  product: Product;
  categoryLabel: string;
  visualInitial: string;
  accentColor: string;
  statusLabel: string;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export function CatalogProductCard({
  product,
  categoryLabel,
  visualInitial,
  accentColor,
  statusLabel,
  onAddToCart,
  className,
}: CatalogProductCardProps) {
  const isAvailable = product.status === 'online';

  return (
    <article
      className={cn(
        'group flex min-h-[178px] flex-col justify-between rounded-[12px] border border-[#243451] bg-[#0b1020] p-3 shadow-[0_18px_32px_rgba(0,0,0,0.34)] transition-all hover:-translate-y-0.5 hover:border-[#3a4d73]',
        className
      )}
    >
      <Link
        to={`/products/${product.id}`}
        className="relative block h-[54px] overflow-hidden rounded-[10px] bg-gradient-to-br from-[#f8fafc] via-[#e7ebf2] to-[#aeb7c8] px-3 py-2 text-[#121827] shadow-[inset_0_-10px_20px_rgba(15,23,42,0.18)]"
      >
        <div className="font-mono text-[7px] font-black uppercase tracking-[1px] text-[#111827]">
          Sản phẩm
        </div>
        <div className="mt-1 max-w-[74%] truncate text-[12px] font-black">{product.name}</div>
        <div
          className="absolute right-[-3px] top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/86 text-[17px] font-black shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
          style={{ color: accentColor }}
        >
          {visualInitial}
        </div>
      </Link>

      <div className="mt-3">
        <div className="font-mono text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#94a3ff]">
          {categoryLabel}
        </div>
        <Link
          to={`/products/${product.id}`}
          className="mt-2 block min-h-[38px] text-[14px] font-extrabold leading-[1.28] text-[#f8fafc] transition-colors line-clamp-2 hover:text-[#35ffb1]"
        >
          {product.name} dùng chung
        </Link>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div className="font-mono text-[14px] font-black tracking-[-0.2px] text-white">
          {formatCurrency(product.price)}
        </div>
        <button
          type="button"
          onClick={() => onAddToCart?.(product)}
          className={cn(
            'h-6 shrink-0 rounded-full border px-2.5 text-[9px] font-black transition-colors',
            isAvailable
              ? 'border-[#0f766e] bg-[#042f2e] text-[#7fffd7] hover:border-[#35ffb1]'
              : 'border-[#8a6b08] bg-[#3a2b03] text-[#ffe27a] hover:border-[#facc15]'
          )}
        >
          {statusLabel}
        </button>
      </div>
    </article>
  );
}
