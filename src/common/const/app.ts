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
    SUPPORT: '/support',
    POLICY: '/policy',
    CONTACT: '/contact',
    LOGIN: '/login',
    REGISTER: '/register',
    ADMIN: '/admin',
  },
} as const;
