export function formatCurrency(amount: number | string, currency: string = 'VND'): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(value)) return '';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateInput: string | Date | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatDateTime(dateInput: string | Date | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
