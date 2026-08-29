export type UserRole = 'user' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}
