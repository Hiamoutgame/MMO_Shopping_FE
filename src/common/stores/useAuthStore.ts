import { create } from 'zustand';
import type { User, AuthTokens } from '../models/user';
import { storage } from '../libs/storage';
import { APP_CONSTANTS } from '../const/app';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: !!storage.get(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN),
  setAuth: (user, tokens) => {
    storage.set(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    storage.set(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    set({ user, tokens, isAuthenticated: true });
  },
  logout: () => {
    storage.remove(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
    set({ user: null, tokens: null, isAuthenticated: false });
  },
}));
