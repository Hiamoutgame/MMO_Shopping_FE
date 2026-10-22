import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Payload ghi gửi thẳng lên BE; BE validate bằng DTO.
type Payload = Record<string, unknown>;

// API Services
export const seasonsAPI = {
  getAll: () => apiClient.get('/seasons'),
  getActive: () => apiClient.get('/seasons/active'),
  getById: (id: string) => apiClient.get(`/seasons/${id}`),
  getBySlug: (slug: string) => apiClient.get(`/seasons/slug/${slug}`),
  create: (data: Payload) => apiClient.post('/seasons', data),
  update: (id: string, data: Payload) => apiClient.put(`/seasons/${id}`, data),
  activate: (id: string) => apiClient.put(`/seasons/${id}/activate`),
  pause: (id: string) => apiClient.put(`/seasons/${id}/pause`),
  end: (id: string) => apiClient.put(`/seasons/${id}/end`),
  delete: (id: string) => apiClient.delete(`/seasons/${id}`),
};

export const pricingAPI = {
  calculate: (data: {
    productId: string;
    quantity: number;
    seasonId?: string;
    packageId?: string;
    couponCode?: string;
  }) => apiClient.post('/pricing/calculate', data),
};

export const packagesAPI = {
  getAll: () => apiClient.get('/packages'),
  getBySeason: (seasonId: string) =>
    apiClient.get(`/packages/season/${seasonId}`),
  getById: (id: string) => apiClient.get(`/packages/${id}`),
  create: (data: Payload) => apiClient.post('/packages', data),
  update: (id: string, data: Payload) => apiClient.put(`/packages/${id}`, data),
  delete: (id: string) => apiClient.delete(`/packages/${id}`),
};

export const couponsAPI = {
  validate: (data: {
    code: string;
    accountId: string;
    roleCode: string;
    productIds?: string[];
    seasonId?: string;
    packageId?: string;
    orderTotal: string;
  }) => apiClient.post('/coupons/validate', data),
  getStats: (voucherId: string) => apiClient.get(`/coupons/stats/${voucherId}`),
};

export const analyticsAPI = {
  getTestCampaigns: () => apiClient.get('/analytics/test-campaigns'),
  createTestCampaign: (data: Payload) =>
    apiClient.post('/analytics/test-campaigns', data),
  evaluateTestCampaign: (id: string) =>
    apiClient.post(`/analytics/test-campaigns/${id}/evaluate`),
  getProfitRecords: (params?: Payload) =>
    apiClient.get('/analytics/profits', { params }),
};
