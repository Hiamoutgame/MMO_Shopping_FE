import type { PaginatedResponse } from '../models/common';

export function normalizeCashbackPage<T>(value: PaginatedResponse<T>): PaginatedResponse<T> {
  const items = Array.isArray(value?.items) ? value.items : [];
  const pageSize = Number(value?.pageSize || items.length || 20);
  const total = Number(value?.total ?? items.length);
  return {
    items,
    total,
    page: Number(value?.page || 1),
    pageSize,
    totalPages: Number(value?.totalPages ?? (pageSize ? Math.ceil(total / pageSize) : 0)),
  };
}

export function cashbackStatusTone(status?: string): 'green' | 'red' | 'amber' | 'blue' | 'gray' {
  const value = status?.toLowerCase();
  if (value === 'approved' || value === 'completed' || value === 'success') return 'green';
  if (value === 'rejected' || value === 'failed' || value === 'recalled') return 'red';
  if (value === 'pending' || value === 'processing') return 'amber';
  if (value === 'paid') return 'blue';
  return 'gray';
}
