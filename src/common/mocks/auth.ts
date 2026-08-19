import type { User, AuthTokens } from '../models/user';

export const MOCK_USER: User = {
  id: 'usr-001',
  email: 'admin@mmo-ai.vn',
  fullName: 'Nguyễn Văn Admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  role: 'admin',
};

export const MOCK_TOKENS: AuthTokens = {
  accessToken: 'mock_jwt_access_token_xyz123',
  refreshToken: 'mock_jwt_refresh_token_abc456',
};
