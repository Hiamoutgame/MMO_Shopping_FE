import type { Product, ProductUiStatus, ProductVariant } from '../models/product';
import type { ProductListItemDto, ProductVariantDto } from '../models/catalog';

export function mapProductStatus(dto: ProductListItemDto): ProductUiStatus {
  if (dto.status !== 'ACTIVE') return 'offline';
  return dto.totalAvailable > 0 ? 'online' : 'out_of_stock';
}

export function mapProductVariant(variant: ProductVariantDto): ProductVariant {
  return {
    id: variant.id,
    sku: variant.sku,
    name: variant.name,
    price: variant.price,
    currency: variant.currency,
    status: variant.status,
    fulfillmentType: variant.fulfillmentType,
    availableQuantity: variant.availableQuantity,
  };
}

export function mapProductDto(dto: ProductListItemDto): Product {
  const variants = (dto.variants ?? []).map(mapProductVariant);
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    price: dto.minPrice ?? '0',
    originalPrice: dto.minPrice ?? undefined,
    status: mapProductStatus(dto),
    category: dto.categories[0]?.name ?? '',
    imageUrl: dto.imageUrls?.[0],
    totalAvailable: dto.totalAvailable,
    variants,
  };
}
