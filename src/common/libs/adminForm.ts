export function getAdminErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
}

export function optionalString(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function optionalNullableString(value: string): string | null | undefined {
  const trimmed = value.trim();
  if (trimmed === '__NULL__') return null;
  return trimmed ? trimmed : undefined;
}

export function optionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : undefined;
}

export function parseLines(value: string): string[] | undefined {
  const items = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

export function parseJsonRecord(value: string, label: string): Record<string, unknown> | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = JSON.parse(trimmed) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${label} phai la JSON object.`);
  }
  return parsed as Record<string, unknown>;
}

export function stringifyJson(value: Record<string, unknown> | null | undefined): string {
  return value ? JSON.stringify(value, null, 2) : '';
}

export function toDateTimeLocal(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function fromDateTimeLocal(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}
