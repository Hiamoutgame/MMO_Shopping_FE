export const API_PATHS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
  },
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    REMOVE: (id: string) => `/cart/${id}`,
  },
} as const;
