import type { StatusTone } from '../../components/StatusBadge/StatusBadge';

/**
 * Ánh xạ trạng thái admin (order/voucher/inventory/payment/account) sang tone màu
 * cho StatusBadge. Chỉ phục vụ hiển thị, không chứa logic nghiệp vụ.
 */
export function orderStatusTone(status: string): StatusTone {
  switch (status) {
    case 'COMPLETED':
    case 'PAID':
      return 'green';
    case 'PENDING':
    case 'PROCESSING':
      return 'amber';
    case 'PARTIALLY_REFUNDED':
      return 'blue';
    case 'REFUNDED':
      return 'violet';
    case 'CANCELLED':
    case 'FAILED':
      return 'red';
    default:
      return 'gray';
  }
}

export function inventoryStatusTone(status: string): StatusTone {
  switch (status) {
    case 'AVAILABLE':
      return 'green';
    case 'RESERVED':
      return 'amber';
    case 'SOLD':
      return 'blue';
    case 'VOID':
      return 'red';
    default:
      return 'gray';
  }
}

export function accountStatusTone(status: string): StatusTone {
  switch (status) {
    case 'ACTIVE':
      return 'green';
    case 'INACTIVE':
      return 'gray';
    case 'SUSPENDED':
      return 'red';
    default:
      return 'gray';
  }
}

export function booleanTone(value: boolean): StatusTone {
  return value ? 'green' : 'gray';
}

export function transactionStatusTone(status: string): StatusTone {
  switch (status) {
    case 'SUCCEEDED':
    case 'COMPLETED':
      return 'green';
    case 'PENDING':
      return 'amber';
    case 'FAILED':
    case 'CANCELLED':
      return 'red';
    default:
      return 'gray';
  }
}

export function labelFromStatus(status: string): string {
  return status.replace(/_/g, ' ').toLowerCase();
}
