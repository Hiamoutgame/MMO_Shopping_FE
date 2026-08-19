export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  status: 'online' | 'offline' | 'out_of_stock';
  category: ProductCategory;
  imageUrl: string;
  isPopular?: boolean;
}

export type ProductCategory = 'chatgpt' | 'midjourney' | 'claude' | 'copilot' | 'other';
