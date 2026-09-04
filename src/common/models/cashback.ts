import type { Money, PaginatedResponse } from './common';

export type CashbackConnectionStatus = 'CONNECTED' | 'REAUTH_REQUIRED' | 'DISCONNECTED';
export type CashbackConnectionStep = 'TWO_FACTOR' | 'VERIFY_EMAIL';

export interface CashbackConnection {
  status: CashbackConnectionStatus;
  providerUserId?: string | null;
  providerEmail?: string | null;
  connectedAt?: string | null;
  lastUsedAt?: string | null;
  challengeMethods?: string[];
  nextStep?: CashbackConnectionStep;
  methods?: string[];
}

export interface CashbackConfig {
  cashback?: {
    shopeeEnabled?: boolean;
    shopeeRate?: number;
    shopeeNotice?: string;
    tiktokEnabled?: boolean;
    tiktokRate?: number;
    tiktokNotice?: string;
    lazadaEnabled?: boolean;
    lazadaRate?: number;
    lazadaNotice?: string;
  };
  withdraw?: {
    enabled?: boolean;
    minAmount?: Money;
    feeType?: 'percentage' | 'fixed';
    feeValue?: Money;
    otpRequired?: boolean;
    bankEnabled?: boolean;
    walletEnabled?: boolean;
    allowedBanks?: string[];
    allowedWallets?: string[];
  };
  features?: Record<string, boolean>;
}

export interface CashbackLinkResult {
  transId: string;
  affiliateUrl: string;
  cashbackAmount: Money;
}

export interface CashbackAccount {
  id: string;
  email: string;
  name?: string | null;
  wallet?: { balance: Money; currency: string };
  balance?: Money;
  stats?: {
    ordersApproved?: number;
    ordersRecalled?: number;
    referralCount?: number;
    [key: string]: unknown;
  };
}

export interface CashbackOrder {
  id?: string;
  orderId: string;
  productName?: string;
  platform?: string;
  originalPrice?: Money;
  cashbackAmount: Money;
  status: string;
  rejectionReason?: string | null;
  createdAt?: string;
  approvedAt?: string | null;
  [key: string]: unknown;
}

export interface CashbackWithdrawal {
  id: string;
  code?: string;
  amount: Money;
  fee?: Money;
  realAmount?: Money;
  paymentMethod?: string;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  status: string;
  createdAt?: string;
}

export interface CashbackPaymentAccount {
  id: string;
  paymentMethod: 'bank' | 'wallet';
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

export interface CashbackBalanceLog {
  id?: string;
  type: string;
  amountChange: Money;
  amountAfter: Money;
  isCredit: boolean;
  description?: string;
  createdAt?: string;
}

export interface CashbackReferralMember {
  id?: string;
  name?: string;
  email?: string;
  level?: number;
  createdAt?: string;
}

export interface CashbackReferralCommission {
  id?: string;
  amount?: Money;
  status?: string;
  description?: string;
  createdAt?: string;
}

export interface CashbackReferralSummary {
  referralCode: string;
  referralLink: string;
  stats?: {
    f1Count?: number;
    f2Count?: number;
    totalCommission?: Money;
  };
  f1Members?: CashbackReferralMember[];
  f2Members?: CashbackReferralMember[];
  commissions?: PaginatedResponse<CashbackReferralCommission>;
}

export interface CashbackListQuery {
  status?: string;
  platform?: string;
  search?: string;
  type?: string;
  level?: 1 | 2;
  page?: number;
  perPage?: number;
}

export interface CreateCashbackWithdrawalRequest {
  amount: string;
  paymentMethod: 'bank' | 'wallet' | 'momo';
  accountNumber: string;
  accountName: string;
  bankName?: string;
  walletName?: string;
  otpCode?: string;
}

export interface CreateCashbackPaymentAccountRequest {
  paymentMethod: 'bank' | 'wallet';
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault?: boolean;
}
