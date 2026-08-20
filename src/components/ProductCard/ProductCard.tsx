import React from 'react';
import type { Product } from '../../common/models/product';
import { formatCurrency } from '../../common/libs/formatter';
import { cn } from '../../common/libs/cn';
import { Link } from 'react-router-dom';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';

export interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onViewDetail?: (product: Product) => void;
}

export function ProductCard({
  product,
  onAddToCart,
  onViewDetail,
  className,
  ...props
}: ProductCardProps) {
  const handleViewDetail = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onViewDetail) return;
    event.preventDefault();
    onViewDetail(product);
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-[18px] bg-[#0C101CEE] border border-white/10 p-5 shadow-[0_14px_28px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-white/20 hover:shadow-[0_18px_36px_rgba(0,0,0,0.5)]',
        className
      )}
      {...props}
    >
      {/* Product Image & Badges */}
      <Link
        to={`/products/${product.id}`}
        onClick={handleViewDetail}
        className="block relative aspect-video w-full overflow-hidden rounded-xl bg-black/40 mb-4 cursor-pointer"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#566079] font-mono text-sm">
            NO IMAGE
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <Chip status={product.status}>
            {product.status === 'online' ? 'Sẵn sàng' : 'Hết hàng'}
          </Chip>
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex-1 flex flex-col">
        <Link
          to={`/products/${product.id}`}
          onClick={handleViewDetail}
          className="text-lg font-bold text-[#F8FAFC] tracking-tight hover:text-[#0EA5FF] cursor-pointer transition-colors line-clamp-1"
        >
          {product.name}
        </Link>
        <p className="mt-2 text-sm text-[#94A3B8] line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Price & Action */}
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
        <div>
          <div className="text-lg font-extrabold font-mono text-[#F8FAFC]">
            {formatCurrency(product.price)}
          </div>
          {product.originalPrice && (
            <div className="text-xs text-[#566079] line-through font-mono">
              {formatCurrency(product.originalPrice)}
            </div>
          )}
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => onAddToCart?.(product)}
        >
          Chọn Mua
        </Button>
      </div>
    </div>
  );
}
