import type { Money } from './common';

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';

export type VariantStatus = 'ACTIVE' | 'INACTIVE';

export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  status?: CategoryStatus;
  parentId?: string | null;
  description?: string | null;
}

export interface ProductVariantDto {
  id: string;
  sku: string;
  name: string;
  price: Money;
  currency: string;
  status: VariantStatus;
  fulfillmentType: string;
  availableQuantity: number;
}

export interface ProductListItemDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrls: string[] | null;
  status: ProductStatus;
  minPrice: Money | null;
  totalAvailable: number;
  categories: CategoryDto[];
  variants: ProductVariantDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetailDto {
  product: ProductListItemDto;
}

export interface ProductListQuery {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: boolean;
}
