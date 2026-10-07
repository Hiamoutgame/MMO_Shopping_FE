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

// API Services
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; fullName: string }) =>
    apiClient.post('/auth/register', data),
  me: () => apiClient.get('/auth/me'),
};

export const seasonsAPI = {
  getAll: () => apiClient.get('/seasons'),
  getActive: () => apiClient.get('/seasons/active'),
  getById: (id: string) => apiClient.get(`/seasons/${id}`),
  getBySlug: (slug: string) => apiClient.get(`/seasons/slug/${slug}`),
  create: (data: any) => apiClient.post('/seasons', data),
  update: (id: string, data: any) => apiClient.put(`/seasons/${id}`, data),
  activate: (id: string) => apiClient.put(`/seasons/${id}/activate`),
  pause: (id: string) => apiClient.put(`/seasons/${id}/pause`),
  end: (id: string) => apiClient.put(`/seasons/${id}/end`),
  delete: (id: string) => apiClient.delete(`/seasons/${id}`),
};

export const chungSucAPI = {
  getCampaigns: () => apiClient.get('/chung-suc/campaigns'),
  getActiveCampaigns: () => apiClient.get('/chung-suc/campaigns/active'),
  getCampaignById: (id: string) => apiClient.get(`/chung-suc/campaigns/${id}`),
  getCampaignBySeason: (seasonId: string) =>
    apiClient.get(`/chung-suc/campaigns/season/${seasonId}`),
  createCampaign: (data: any) => apiClient.post('/chung-suc/campaigns', data),
  updateCampaign: (id: string, data: any) =>
    apiClient.put(`/chung-suc/campaigns/${id}`, data),
  joinCampaign: (id: string, accountId: string, quantity: number) =>
    apiClient.post(`/chung-suc/campaigns/${id}/join`, { accountId, quantity }),
  getParticipants: (campaignId: string) =>
    apiClient.get(`/chung-suc/campaigns/${campaignId}/participants`),
};

export const pricingAPI = {
  calculate: (data: {
    productId: string;
    accountId: string;
    quantity: number;
    seasonId?: string;
    packageId?: string;
    sellerCode?: string;
    couponCode?: string;
  }) => apiClient.post('/pricing/calculate', data),
};

export const packagesAPI = {
  getAll: () => apiClient.get('/packages'),
  getBySeason: (seasonId: string) =>
    apiClient.get(`/packages/season/${seasonId}`),
  getById: (id: string) => apiClient.get(`/packages/${id}`),
  create: (data: any) => apiClient.post('/packages', data),
  update: (id: string, data: any) => apiClient.put(`/packages/${id}`, data),
  delete: (id: string) => apiClient.delete(`/packages/${id}`),
};

export const sellersAPI = {
  getProfile: (accountId: string) => apiClient.get(`/sellers/profile/${accountId}`),
  createProfile: (data: any) => apiClient.post('/sellers/profile', data),
  updateProfile: (accountId: string, data: any) =>
    apiClient.put(`/sellers/profile/${accountId}`, data),
  approveProfile: (id: string) => apiClient.put(`/sellers/${id}/approve`),
  rejectProfile: (id: string) => apiClient.put(`/sellers/${id}/reject`),
  generateReferralCode: (sellerId: string) =>
    apiClient.post('/sellers/referral-codes', { sellerId }),
  trackClick: (data: any) => apiClient.post('/sellers/track-click', data),
  getStats: (sellerId: string) => apiClient.get(`/sellers/${sellerId}/stats`),
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
  createTestCampaign: (data: any) =>
    apiClient.post('/analytics/test-campaigns', data),
  evaluateTestCampaign: (id: string) =>
    apiClient.post(`/analytics/test-campaigns/${id}/evaluate`),
  getProfitRecords: (params?: any) =>
    apiClient.get('/analytics/profits', { params }),
};
