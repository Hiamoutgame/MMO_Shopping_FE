import type { StatusTone } from '../../components/StatusBadge/StatusBadge';
import type { ParticipantStatus } from '../models/chungSuc';

export const REQUEST_STATUS_LABELS: Record<ParticipantStatus, string> = {
  PENDING: 'Chờ xử lý',
  CHECKING: 'Đang kiểm tra mã',
  PROCESSING: 'Đang tiếp sức',
  SUCCESS: 'Hoàn tất',
  PARTIAL_SUCCESS: 'Hoàn tất một phần',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
};

// Khớp ADMIN_STATUS_TRANSITIONS ở BE (participant-status.enum.ts).
export const ADMIN_REQUEST_TRANSITIONS: Partial<Record<ParticipantStatus, ParticipantStatus[]>> = {
  PENDING: ['CHECKING', 'PROCESSING', 'FAILED'],
  CHECKING: ['PROCESSING', 'FAILED'],
  PROCESSING: ['SUCCESS', 'PARTIAL_SUCCESS', 'FAILED'],
};

export function requestStatusTone(status: ParticipantStatus): StatusTone {
  switch (status) {
    case 'SUCCESS':
      return 'green';
    case 'PARTIAL_SUCCESS':
    case 'CHECKING':
    case 'PROCESSING':
      return 'blue';
    case 'PENDING':
      return 'amber';
    case 'FAILED':
      return 'red';
    default:
      return 'gray';
  }
}
