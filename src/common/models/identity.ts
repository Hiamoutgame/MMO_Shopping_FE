import type { UserRole, UserStatus } from './user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken?: string;
}

export interface AuthAccountDto {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface AuthResponseDto {
  account: AuthAccountDto;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
  };
}

export interface RefreshResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface MeResponseDto {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  role: {
    id: string;
    code: string;
    name: string;
  } | null;
}
