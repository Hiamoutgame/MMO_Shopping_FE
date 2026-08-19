export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  status: 'online' | 'offline' | 'out_of_stock';
  category: string;
  metaTags?: string[];
  imageUrl?: string;
  isPopular?: boolean;
}

export type ProductCategory =
  | 'chatgpt'
  | 'canva'
  | 'gemini'
  | 'youtube'
  | 'capcut'
  | 'office'
  | 'turnitin'
  | 'netflix'
  | 'claude'
  | 'copilot'
  | 'other';
