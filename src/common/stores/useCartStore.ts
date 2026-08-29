import { create } from 'zustand';
import type { Product } from '../models/product';
import { storage } from '../libs/storage';
import { APP_CONSTANTS } from '../const/app';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const initialItems = storage.get<CartItem[]>(APP_CONSTANTS.STORAGE_KEYS.CART_STATE, []) || [];

export const useCartStore = create<CartState>((set, get) => ({
  items: initialItems,

  addToCart: (product, quantity = 1) => {
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex((item) => item.product.id === product.id);

    let updatedItems: CartItem[];
    if (existingIndex > -1) {
      updatedItems = [...currentItems];
      updatedItems[existingIndex].quantity += quantity;
    } else {
      updatedItems = [...currentItems, { product, quantity }];
    }

    storage.set(APP_CONSTANTS.STORAGE_KEYS.CART_STATE, updatedItems);
    set({ items: updatedItems });
  },

  removeFromCart: (productId) => {
    const updatedItems = get().items.filter((item) => item.product.id !== productId);
    storage.set(APP_CONSTANTS.STORAGE_KEYS.CART_STATE, updatedItems);
    set({ items: updatedItems });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const updatedItems = get().items.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    storage.set(APP_CONSTANTS.STORAGE_KEYS.CART_STATE, updatedItems);
    set({ items: updatedItems });
  },

  clearCart: () => {
    storage.remove(APP_CONSTANTS.STORAGE_KEYS.CART_STATE);
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    // Draft cart (GĐ3 sẽ thay bằng pricing từ backend): chỉ dùng cho hiển thị tạm.
    return get().items.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0);
  },
}));
