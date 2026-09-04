import type { ApiError } from '../models/common';

export function readApiError(reason: unknown, fallback = 'Yêu cầu thất bại. Vui lòng thử lại.'): string {
  const error = reason as Partial<ApiError>;
  return error?.message || fallback;
}
