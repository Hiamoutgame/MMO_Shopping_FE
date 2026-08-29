import type { Product } from '../models/product';

export type CatalogCategoryKey =
  | 'all'
  | 'ai'
  | 'creative'
  | 'workspace'
  | 'security';

export interface CatalogCategory {
  key: CatalogCategoryKey;
  label: string;
  productCategories: string[];
}

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  { key: 'all', label: 'Tất cả', productCategories: [] },
  { key: 'ai', label: 'Tài khoản AI', productCategories: ['chatgpt', 'gemini', 'claude', 'copilot'] },
  { key: 'creative', label: 'Sáng tạo', productCategories: ['canva', 'capcut', 'adobe', 'youtube'] },
  { key: 'workspace', label: 'Lưu trữ & văn phòng', productCategories: ['office', 'gmail', 'drive'] },
  { key: 'security', label: 'VPN / khóa bản quyền', productCategories: ['vpn', 'hma', 'voucher', 'vietmap', 'turnitin', 'netflix', 'other'] },
];

const CATEGORY_LABELS: Record<string, string> = {
  chatgpt: 'AI',
  gemini: 'AI',
  claude: 'AI',
  copilot: 'AI',
  canva: 'Sáng tạo',
  capcut: 'Sáng tạo',
  adobe: 'Sáng tạo',
  youtube: 'Sáng tạo',
  office: 'Văn phòng',
  gmail: 'Lưu trữ',
  drive: 'Lưu trữ',
  vpn: 'VPN',
  hma: 'VPN',
  voucher: 'Tài chính',
  vietmap: 'Tiện ích',
  turnitin: 'Bản quyền',
  netflix: 'Giải trí',
  other: 'Tiện ích',
};

const ACCENT_COLORS: Record<string, string> = {
  chatgpt: '#20c997',
  gemini: '#5d8cff',
  claude: '#ff5c5c',
  canva: '#9b5cff',
  capcut: '#111827',
  adobe: '#e53935',
  youtube: '#ff2f4f',
  office: '#ff8a1d',
  gmail: '#ea4335',
  drive: '#34a853',
  vpn: '#35ffb1',
  hma: '#facc15',
  voucher: '#60a5fa',
  vietmap: '#22c55e',
  turnitin: '#35ffb1',
  netflix: '#e50914',
};

export function isProductInCatalogCategory(product: Product, categoryKey: CatalogCategoryKey) {
  if (categoryKey === 'all') return true;
  const category = CATALOG_CATEGORIES.find((item) => item.key === categoryKey);
  return Boolean(category?.productCategories.includes(product.category));
}

export function getCatalogCategoryLabel(product: Product) {
  return CATEGORY_LABELS[product.category] ?? (product.category || 'Sản phẩm');
}

export function getProductVisualInitial(product: Product) {
  return product.name.trim().charAt(0).toUpperCase();
}

export function getProductAccentColor(product: Product) {
  return ACCENT_COLORS[product.category] ?? '#35ffb1';
}

export function getProductStatusLabel(product: Product) {
  if (product.status === 'online') return 'Còn hàng';
  if (product.status === 'out_of_stock') return 'Hết hàng';
  return 'Sắp hết';
}
