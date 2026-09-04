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

export function compareDecimalStrings(left: string, right: string): number {
  const normalize = (input: string) => {
    const [whole = '0', fraction = ''] = input.trim().replace(/^\+/, '').split('.');
    return { whole: whole.replace(/^0+(?=\d)/, ''), fraction: fraction.replace(/0+$/, '') };
  };
  const a = normalize(left);
  const b = normalize(right);
  if (a.whole.length !== b.whole.length) return a.whole.length > b.whole.length ? 1 : -1;
  if (a.whole !== b.whole) return a.whole > b.whole ? 1 : -1;
  const length = Math.max(a.fraction.length, b.fraction.length);
  const af = a.fraction.padEnd(length, '0');
  const bf = b.fraction.padEnd(length, '0');
  return af === bf ? 0 : af > bf ? 1 : -1;
}
