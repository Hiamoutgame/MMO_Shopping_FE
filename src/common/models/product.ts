import type { Money } from './common';

export type ProductUiStatus = 'online' | 'offline' | 'out_of_stock';

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: Money;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE';
  fulfillmentType: string;
  availableQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: Money;
  originalPrice?: Money;
  status: ProductUiStatus;
  category: string;
  metaTags?: string[];
  imageUrl?: string;
  isPopular?: boolean;
  groupId?: string;
  variantLabel?: string;
  totalAvailable?: number;
  variants?: ProductVariant[];
}

export type ProductCategory =
  | 'chatgpt'
  | 'canva'
  | 'gemini'
  | 'youtube'
  | 'capcut'
  | 'adobe'
  | 'gmail'
  | 'drive'
  | 'office'
  | 'vpn'
  | 'hma'
  | 'voucher'
  | 'vietmap'
  | 'turnitin'
  | 'netflix'
  | 'claude'
  | 'copilot'
  | 'other';
