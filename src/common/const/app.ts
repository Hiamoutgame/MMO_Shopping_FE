export const APP_CONSTANTS = {
  PAGE_SIZE: 12,
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'mmo_access_token',
    REFRESH_TOKEN: 'mmo_refresh_token',
    CART_STATE: 'mmo_cart_state',
  },
  ROUTES: {
    HOME: '/',
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/products/:id',
    CART: '/cart',
    WALLET: '/wallet',
    SUPPORT: '/support',
    CASHBACK: '/cashback',
    CHUNG_SUC: '/chung-suc',
    CHUNG_SUC_JOIN: '/chung-suc/:campaignId/join',
    POLICY: '/policy',
    CONTACT: '/contact',
    LOGIN: '/login',
    REGISTER: '/register',
    ADMIN: '/admin',
  },
} as const;

export const FEATURE_FLAGS = {
  CASHBACK: import.meta.env.VITE_ENABLE_CASHBACK === 'true',
} as const;
