import { API_PATHS } from '../const/apiPath';
import type { PaginatedResponse } from '../models/common';
import type {
  CashbackAccount,
  CashbackBalanceLog,
  CashbackConfig,
  CashbackConnection,
  CashbackLinkResult,
  CashbackListQuery,
  CashbackOrder,
  CashbackPaymentAccount,
  CashbackReferralSummary,
  CashbackWithdrawal,
  CreateCashbackPaymentAccountRequest,
  CreateCashbackWithdrawalRequest,
} from '../models/cashback';
import { httpClient } from './httpClient';

export const cashbackApi = {
  getConfig: () => httpClient.get<CashbackConfig>(API_PATHS.CASHBACK.CONFIG),
  getConnection: () => httpClient.get<CashbackConnection>(API_PATHS.CASHBACK.CONNECTION),
  login: (payload: { email: string; password: string; deviceName?: string }) =>
    httpClient.post<CashbackConnection>(API_PATHS.CASHBACK.LOGIN, payload),
  verifyTwoFactor: (payload: { google2faCode?: string; emailOtpCode?: string }) =>
    httpClient.post<CashbackConnection>(API_PATHS.CASHBACK.TWO_FACTOR, payload),
  resendTwoFactor: () => httpClient.post<unknown>(API_PATHS.CASHBACK.TWO_FACTOR_RESEND),
  verifyEmail: (code: string) =>
    httpClient.post<CashbackConnection>(API_PATHS.CASHBACK.VERIFY_EMAIL, { code }),
  resendVerifyEmail: () => httpClient.post<unknown>(API_PATHS.CASHBACK.VERIFY_EMAIL_RESEND),
  unlink: () => httpClient.delete<CashbackConnection>(API_PATHS.CASHBACK.CONNECTION),
  createLink: (url: string) =>
    httpClient.post<CashbackLinkResult>(API_PATHS.CASHBACK.LINK, { url }),
  getAccount: () => httpClient.get<CashbackAccount>(API_PATHS.CASHBACK.ACCOUNT),
  listOrders: (params: CashbackListQuery) =>
    httpClient.get<PaginatedResponse<CashbackOrder>>(API_PATHS.CASHBACK.ORDERS, { params }),
  getOrder: (id: string) => httpClient.get<CashbackOrder>(API_PATHS.CASHBACK.ORDER_DETAIL(id)),
  listWithdrawals: (params: CashbackListQuery) =>
    httpClient.get<PaginatedResponse<CashbackWithdrawal>>(API_PATHS.CASHBACK.WITHDRAWALS, { params }),
  createWithdrawal: (payload: CreateCashbackWithdrawalRequest) =>
    httpClient.post<CashbackWithdrawal>(API_PATHS.CASHBACK.WITHDRAWALS, payload),
  sendWithdrawalOtp: () => httpClient.post<unknown>(API_PATHS.CASHBACK.WITHDRAWAL_OTP, {}),
  listPaymentAccounts: () =>
    httpClient.get<{ items: CashbackPaymentAccount[]; total: number }>(API_PATHS.CASHBACK.PAYMENT_ACCOUNTS),
  createPaymentAccount: (payload: CreateCashbackPaymentAccountRequest) =>
    httpClient.post<CashbackPaymentAccount>(API_PATHS.CASHBACK.PAYMENT_ACCOUNTS, payload),
  setDefaultPaymentAccount: (id: string) =>
    httpClient.post<CashbackPaymentAccount>(API_PATHS.CASHBACK.PAYMENT_ACCOUNT_DEFAULT(id)),
  deletePaymentAccount: (id: string) =>
    httpClient.delete<unknown>(API_PATHS.CASHBACK.PAYMENT_ACCOUNT_DETAIL(id)),
  getReferrals: (params: CashbackListQuery) =>
    httpClient.get<CashbackReferralSummary>(API_PATHS.CASHBACK.REFERRALS, { params }),
  listBalanceLogs: (params: CashbackListQuery) =>
    httpClient.get<PaginatedResponse<CashbackBalanceLog>>(API_PATHS.CASHBACK.BALANCE_LOGS, { params }),
};
