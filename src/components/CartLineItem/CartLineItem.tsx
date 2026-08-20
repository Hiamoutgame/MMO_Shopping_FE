import { Link } from 'react-router-dom';
import { formatCurrency } from '../../common/libs/formatter';
import type { Product } from '../../common/models/product';

export interface CartLineItemProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function CartLineItem({ product, quantity, onQuantityChange, onRemove }: CartLineItemProps) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0C101CEE] p-4 shadow-[0_14px_28px_rgba(0,0,0,0.35)] transition-colors hover:border-white/20 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-16 w-16 shrink-0 rounded-xl object-cover bg-black/40 sm:h-20 sm:w-20"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] font-mono font-bold uppercase text-[#0EA5FF]">
            {product.category}
          </span>
          <Link
            to={`/products/${product.id}`}
            className="line-clamp-2 text-sm font-bold text-white transition-colors hover:text-[#0EA5FF] sm:text-base"
          >
            {product.name}
          </Link>
          <span className="text-sm font-mono text-[#94A3B8]">{formatCurrency(product.price)}</span>
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-4 border-t border-white/5 pt-3 sm:w-auto sm:border-t-0 sm:pt-0">
        <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-1">
          <button
            type="button"
            onClick={() => onQuantityChange(quantity - 1)}
            aria-label={`Giảm số lượng ${product.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            -
          </button>
          <span className="w-8 text-center text-sm font-mono font-bold text-white">{quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            aria-label={`Tăng số lượng ${product.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            +
          </button>
        </div>
        <strong className="text-right text-sm font-extrabold font-mono text-white sm:text-base">
          {formatCurrency(product.price * quantity)}
        </strong>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Xóa ${product.name} khỏi giỏ hàng`}
          title="Xóa sản phẩm"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#566079] transition-colors hover:bg-white/5 hover:text-[#FF5C5C]"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </article>
  );
}
