export type Money = string;

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  errorCode: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  status: number | null;
  message: string;
  errorCode: string | null;
  fieldErrors?: Record<string, string[]>;
}

export interface ApiRequestOptions {
  idempotencyKey?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  keyword?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
