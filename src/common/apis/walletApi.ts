import { API_PATHS } from '../const/apiPath';
import type { PaginatedResponse } from '../models/common';
import type {
  DepositConfig,
  DepositDto,
  WalletDto,
  WalletTransactionDto,
} from '../models/wallet';
import { httpClient } from './httpClient';

interface PageQuery {
  page?: number;
  pageSize?: number;
}

export const walletApi = {
  getWallet: () => httpClient.get<{ wallet: WalletDto }>(API_PATHS.WALLET.GET),
  getDepositConfig: () => httpClient.get<DepositConfig>(API_PATHS.WALLET.DEPOSIT_CONFIG),
  /** idempotencyKey giữ nguyên khi bấm lại sau lỗi mạng để không tạo trùng yêu cầu. */
  createDeposit: (amount: string, idempotencyKey: string) =>
    httpClient.post<{ deposit: DepositDto }>(
      API_PATHS.WALLET.DEPOSITS,
      { amount },
      { idempotencyKey },
    ),
  listDeposits: (query: PageQuery = {}) =>
    httpClient.get<PaginatedResponse<DepositDto>>(API_PATHS.WALLET.DEPOSITS, { params: query }),
  getDeposit: (id: string) =>
    httpClient.get<{ deposit: DepositDto }>(API_PATHS.WALLET.DEPOSIT_DETAIL(id)),
  listTransactions: (query: PageQuery = {}) =>
    httpClient.get<PaginatedResponse<WalletTransactionDto>>(API_PATHS.WALLET.TRANSACTIONS, {
      params: query,
    }),
};
