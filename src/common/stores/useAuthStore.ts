import { create } from 'zustand';
import type { AuthTokens, User } from '../models/user';
import { session } from '../apis/session';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  startInitializing: () => void;
  finishInitializing: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isInitializing: false,
  setAuth: (user, tokens) => {
    session.setTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    set({ user, tokens, isAuthenticated: true });
  },
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearAuth: () => {
    session.clear();
    set({ user: null, tokens: null, isAuthenticated: false });
  },
  startInitializing: () => set({ isInitializing: true }),
  finishInitializing: () => set({ isInitializing: false }),
}));
