import { storage } from '../libs/storage';
import { APP_CONSTANTS } from '../const/app';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null): void {
  sessionExpiredHandler = handler;
}

export const session = {
  getAccessToken(): string | null {
    return storage.get<string>(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken(): string | null {
    return storage.get<string>(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
  },

  setTokens(tokens: StoredTokens): void {
    storage.set(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    storage.set(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  },

  clear(): void {
    storage.remove(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
  },

  notifyExpired(): void {
    sessionExpiredHandler?.();
  },
};
