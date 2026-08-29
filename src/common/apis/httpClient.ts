import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiEnvelope, ApiError, ApiRequestOptions } from '../models/common';
import { session } from './session';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

interface RetryConfig extends AxiosRequestConfig {
  _retried?: boolean;
}

// Không chạy refresh cho login/register/refresh — chúng không cần bearer và
// refresh tự gọi là request duy nhất phục vụ các request 401 đang chờ.
const SKIP_REFRESH_PATHS = new Set<string>([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
]);

function isSkipRefreshPath(url?: string): boolean {
  return Boolean(url && SKIP_REFRESH_PATHS.has(url));
}

function toApiError(error: unknown): ApiError {
  const axiosError = error as AxiosError<ApiEnvelope<unknown>>;
  const status = axiosError.response?.status ?? null;
  const body = axiosError.response?.data;

  if (body && typeof body === 'object' && 'success' in body) {
    const message =
      typeof body.message === 'string' && body.message
        ? body.message
        : status === null
          ? 'Không thể kết nối tới máy chủ.'
          : 'Yêu cầu thất bại.';
    return {
      status,
      message,
      errorCode: body.errorCode ?? null,
    };
  }

  if (status === null) {
    return {
      status: null,
      message: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.',
      errorCode: 'NETWORK_ERROR',
    };
  }

  return {
    status,
    message: axiosError.message || 'Yêu cầu thất bại.',
    errorCode: null,
  };
}

class HttpClient {
  private readonly instance: AxiosInstance;
  private refreshPromise: Promise<RefreshResult> | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = session.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  private setAccessToken(token: string): void {
    this.instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  private async refreshTokens(): Promise<RefreshResult> {
    const refreshToken = session.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await axios.post<ApiEnvelope<RefreshResult>>(
      `${BASE_URL}/auth/refresh`,
      { refreshToken },
      { timeout: 10000, headers: { 'Content-Type': 'application/json' } },
    );

    const result = response.data?.data;
    if (!response.data?.success || !result) {
      throw new Error('Refresh failed');
    }

    session.setTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    this.setAccessToken(result.accessToken);
    return result;
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.request<ApiEnvelope<T>>(config);
      const body = response.data;
      if (!body || body.success === false) {
        throw {
          isApiError: true,
          status: response.status,
          body,
        } as const;
      }
      return body.data as T;
    } catch (error) {
      if (this.isApiErrorMarker(error)) {
        throw toApiError({
          response: {
            status: error.status,
            data: error.body,
          },
        });
      }
      if (this.shouldRefresh(error as AxiosError, config)) {
        return this.handleRetryWithRefresh<T>(error as AxiosError, config);
      }
      throw toApiError(error);
    }
  }

  private isApiErrorMarker(error: unknown): error is { isApiError: true; status: number; body: ApiEnvelope<unknown> | undefined } {
    return Boolean(error && typeof error === 'object' && (error as { isApiError?: boolean }).isApiError);
  }

  private shouldRefresh(error: AxiosError, config: AxiosRequestConfig): boolean {
    return (
      error.response?.status === 401 &&
      !isSkipRefreshPath(config.url) &&
      !(config as RetryConfig)._retried &&
      Boolean(session.getRefreshToken())
    );
  }

  private async handleRetryWithRefresh<T>(
    error: AxiosError,
    config: AxiosRequestConfig,
  ): Promise<T> {
    try {
      this.refreshPromise = this.refreshPromise ?? this.refreshTokens().finally(() => {
        this.refreshPromise = null;
      });
      await this.refreshPromise;
    } catch {
      session.clear();
      session.notifyExpired();
      throw toApiError(error);
    }

    const retryConfig: RetryConfig = {
      ...config,
      _retried: true,
      headers: {
        ...(config.headers as Record<string, unknown>),
        Authorization: `Bearer ${session.getAccessToken()}`,
      },
    };
    return this.request<T>(retryConfig);
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig & ApiRequestOptions): Promise<T> {
    const { idempotencyKey, ...axiosConfig } = config ?? {};
    const headers =
      idempotencyKey === undefined
        ? axiosConfig.headers
        : {
            ...(axiosConfig.headers as Record<string, unknown>),
            'Idempotency-Key': idempotencyKey,
          };
    return this.request<T>({ ...axiosConfig, method: 'POST', url, data, headers });
  }

  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

export const httpClient = new HttpClient();
