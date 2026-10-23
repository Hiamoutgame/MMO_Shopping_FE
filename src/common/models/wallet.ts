import type { Money } from './common';

export type DepositStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';

export interface WalletDto {
  id: string;
  accountId: string;
  currency: string;
  balance: Money;
  updatedAt: string;
}

export interface DepositInstructions {
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  amount: Money;
  transferContent: string;
  qrImageUrl: string;
}

export interface DepositDto {
  id: string;
  provider: string;
  paymentCode: string;
  amount: Money;
  requestedAmount: Money;
  currency: string;
  status: DepositStatus;
  isExpired: boolean;
  expiresAt: string | null;
  completedAt: string | null;
  createdAt: string;
  instructions: DepositInstructions | null;
}

export interface DepositConfig {
  enabled: boolean;
  minAmount: Money;
  maxAmount: Money;
  expiresMinutes: number;
  currency: string;
}

export interface WalletTransactionDto {
  id: string;
  walletId: string;
  orderId: string | null;
  paymentTransactionId: string | null;
  type: 'CREDIT' | 'DEBIT';
  amount: Money;
  balanceBefore: Money;
  balanceAfter: Money;
  status: string;
  purpose: string;
  description: string | null;
  createdAt: string;
}
