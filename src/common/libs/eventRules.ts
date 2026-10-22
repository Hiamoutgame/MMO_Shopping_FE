import type { EventRules, EventVariant } from '../models/chungSuc';

export const EVENT_VARIANT_LABELS: Record<EventVariant, string> = {
  XAP_XINH: 'Xập Xình',
  DOT_PHAO: 'Đốt Pháo',
  TINH_HOA: 'Tinh Hoa Hội Tụ',
  BAN_BI: 'Bắn Bi',
  CUSTOM: 'Tuỳ chỉnh',
};

function limitText(perDay: number | null, total: number | null, dailyReset: boolean): string {
  const parts: string[] = [];
  if (dailyReset && perDay !== null) parts.push(`${perDay}/ngày`);
  if (total !== null) parts.push(`${total}/sự kiện`);
  return parts.length ? parts.join(' · ') : 'không giới hạn';
}

// Tóm tắt luật thành các dòng ngắn để hiển thị cho admin và khách.
export function describeEventRules(rules: EventRules): Array<{ label: string; value: string }> {
  const items = [
    {
      label: 'Mỗi mã mời nhận',
      value: limitText(rules.ownerLimitPerDay, rules.ownerLimitTotal, rules.dailyReset),
    },
    {
      label: 'Mỗi tài khoản hỗ trợ giúp',
      value: limitText(rules.helperLimitPerDay, rules.helperLimitTotal, rules.dailyReset),
    },
    {
      label: 'Reset lượt',
      value: rules.dailyReset ? '00:00 mỗi ngày' : 'không reset',
    },
  ];
  if (rules.pointsCap !== null) {
    items.push({ label: 'Điểm tối đa', value: rules.pointsCap.toLocaleString('vi-VN') });
  }
  return items;
}
