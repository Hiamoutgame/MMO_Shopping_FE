import { httpClient } from './httpClient';
import { API_PATHS } from '../const/apiPath';
import type {
  AdminAccountDto,
  AdminAccountQuery,
  AdminCategoryDto,
  AdminCategoryQuery,
  AdminInventoryItemDto,
  AdminInventoryQuery,
  AdminOrderDto,
  AdminOrderQuery,
  AdminPagedQuery,
  AdminPaymentQuery,
  AdminPaymentTransactionDto,
  AdminProductDto,
  AdminProductQuery,
  AdminRoleDto,
  AdminVoucherDto,
  AdminWalletLedgerDto,
  AdminWalletLedgerQuery,
  AuditLogDto,
  AuditLogQuery,
  CreateAccountRequest,
  CreateCategoryRequest,
  CreateInventoryItemRequest,
  CreateProductRequest,
  CreateVariantRequest,
  CreateVoucherRequest,
  DashboardOverviewDto,
  OrderStatus,
  ReportSummaryDto,
  UpdateAccountRequest,
  UpdateCategoryRequest,
  UpdateInventoryItemRequest,
  UpdateProductRequest,
  UpdateVariantRequest,
  UpdateVoucherRequest,
} from '../models/admin';
import type { PaginatedResponse } from '../models/common';

function toParams(query: object): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value as string | number | boolean;
    }
  }
  return params;
}

// ---------------------------------------------------------------------------
// System
// ---------------------------------------------------------------------------

export const adminSystemApi = {
  dashboardOverview(): Promise<{ overview: DashboardOverviewDto }> {
    return httpClient.get<{ overview: DashboardOverviewDto }>(
      API_PATHS.ADMIN.DASHBOARD_OVERVIEW,
    );
  },

  reportsSummary(query: { from?: string; to?: string; timezone?: string } = {}): Promise<{
    summaryReport: ReportSummaryDto;
  }> {
    return httpClient.get<{ summaryReport: ReportSummaryDto }>(
      API_PATHS.ADMIN.REPORTS_SUMMARY,
      { params: toParams(query) },
    );
  },

  auditLogs(query: AuditLogQuery = {}): Promise<PaginatedResponse<AuditLogDto>> {
    return httpClient.get<PaginatedResponse<AuditLogDto>>(API_PATHS.ADMIN.AUDIT_LOGS, {
      params: toParams(query),
    });
  },
};

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

export const adminIdentityApi = {
  accounts(query: AdminAccountQuery = {}): Promise<PaginatedResponse<AdminAccountDto>> {
    return httpClient.get<PaginatedResponse<AdminAccountDto>>(API_PATHS.ADMIN.ACCOUNTS, {
      params: toParams(query),
    });
  },

  account(id: string): Promise<{ account: AdminAccountDto }> {
    return httpClient.get<{ account: AdminAccountDto }>(API_PATHS.ADMIN.ACCOUNT_DETAIL(id));
  },

  createAccount(payload: CreateAccountRequest): Promise<{ account: { id: string } }> {
    return httpClient.post<{ account: { id: string } }>(API_PATHS.ADMIN.ACCOUNTS, payload);
  },

  updateAccount(id: string, payload: UpdateAccountRequest): Promise<{ account: { id: string } }> {
    return httpClient.patch<{ account: { id: string } }>(
      API_PATHS.ADMIN.ACCOUNT_DETAIL(id),
      payload,
    );
  },

  deleteAccount(id: string): Promise<{ deletedAt: string }> {
    return httpClient.delete<{ deletedAt: string }>(API_PATHS.ADMIN.ACCOUNT_DETAIL(id));
  },

  roles(): Promise<{ roles: AdminRoleDto[] }> {
    return httpClient.get<{ roles: AdminRoleDto[] }>(API_PATHS.ADMIN.ROLES);
  },
};

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export const adminCatalogApi = {
  categories(query: AdminCategoryQuery = {}): Promise<PaginatedResponse<AdminCategoryDto>> {
    return httpClient.get<PaginatedResponse<AdminCategoryDto>>(API_PATHS.ADMIN.CATEGORIES, {
      params: toParams(query),
    });
  },

  category(id: string): Promise<{ category: AdminCategoryDto }> {
    return httpClient.get<{ category: AdminCategoryDto }>(API_PATHS.ADMIN.CATEGORY_DETAIL(id));
  },

  createCategory(payload: CreateCategoryRequest): Promise<{ category: AdminCategoryDto }> {
    return httpClient.post<{ category: AdminCategoryDto }>(
      API_PATHS.ADMIN.CATEGORIES,
      payload,
    );
  },

  updateCategory(id: string, payload: UpdateCategoryRequest): Promise<{ category: AdminCategoryDto }> {
    return httpClient.patch<{ category: AdminCategoryDto }>(
      API_PATHS.ADMIN.CATEGORY_DETAIL(id),
      payload,
    );
  },

  deleteCategory(id: string): Promise<{ deletedAt: string }> {
    return httpClient.delete<{ deletedAt: string }>(API_PATHS.ADMIN.CATEGORY_DETAIL(id));
  },

  products(query: AdminProductQuery = {}): Promise<PaginatedResponse<AdminProductDto>> {
    return httpClient.get<PaginatedResponse<AdminProductDto>>(API_PATHS.ADMIN.PRODUCTS, {
      params: toParams(query),
    });
  },

  product(id: string): Promise<{ product: AdminProductDto }> {
    return httpClient.get<{ product: AdminProductDto }>(API_PATHS.ADMIN.PRODUCT_DETAIL(id));
  },

  createProduct(payload: CreateProductRequest): Promise<{ product: AdminProductDto }> {
    return httpClient.post<{ product: AdminProductDto }>(API_PATHS.ADMIN.PRODUCTS, payload);
  },

  updateProduct(id: string, payload: UpdateProductRequest): Promise<{ product: AdminProductDto }> {
    return httpClient.patch<{ product: AdminProductDto }>(
      API_PATHS.ADMIN.PRODUCT_DETAIL(id),
      payload,
    );
  },

  deleteProduct(id: string): Promise<{ deletedAt: string }> {
    return httpClient.delete<{ deletedAt: string }>(API_PATHS.ADMIN.PRODUCT_DETAIL(id));
  },

  createVariant(productId: string, payload: CreateVariantRequest): Promise<{ variant: AdminProductDto['variants'][number] }> {
    return httpClient.post<{ variant: AdminProductDto['variants'][number] }>(
      API_PATHS.ADMIN.PRODUCT_VARIANTS(productId),
      payload,
    );
  },

  updateVariant(id: string, payload: UpdateVariantRequest): Promise<{ variant: AdminProductDto['variants'][number] }> {
    return httpClient.patch<{ variant: AdminProductDto['variants'][number] }>(
      API_PATHS.ADMIN.VARIANT_DETAIL(id),
      payload,
    );
  },

  deleteVariant(id: string): Promise<{ deletedAt: string }> {
    return httpClient.delete<{ deletedAt: string }>(API_PATHS.ADMIN.VARIANT_DETAIL(id));
  },
};

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export const adminInventoryApi = {
  items(query: AdminInventoryQuery = {}): Promise<PaginatedResponse<AdminInventoryItemDto>> {
    return httpClient.get<PaginatedResponse<AdminInventoryItemDto>>(
      API_PATHS.ADMIN.INVENTORY_ITEMS,
      { params: toParams(query) },
    );
  },

  item(id: string): Promise<AdminInventoryItemDto> {
    return httpClient.get<AdminInventoryItemDto>(API_PATHS.ADMIN.INVENTORY_ITEM_DETAIL(id));
  },

  create(payload: CreateInventoryItemRequest): Promise<{ inventoryItem: AdminInventoryItemDto }> {
    return httpClient.post<{ inventoryItem: AdminInventoryItemDto }>(
      API_PATHS.ADMIN.INVENTORY_ITEMS,
      payload,
    );
  },

  update(id: string, payload: UpdateInventoryItemRequest): Promise<{ inventoryItem: AdminInventoryItemDto }> {
    return httpClient.patch<{ inventoryItem: AdminInventoryItemDto }>(
      API_PATHS.ADMIN.INVENTORY_ITEM_DETAIL(id),
      payload,
    );
  },
};

// ---------------------------------------------------------------------------
// Commerce
// ---------------------------------------------------------------------------

export const adminCommerceApi = {
  orders(query: AdminOrderQuery = {}): Promise<PaginatedResponse<AdminOrderDto>> {
    return httpClient.get<PaginatedResponse<AdminOrderDto>>(API_PATHS.ADMIN.ORDERS, {
      params: toParams(query),
    });
  },

  order(id: string): Promise<{ order: AdminOrderDto }> {
    return httpClient.get<{ order: AdminOrderDto }>(API_PATHS.ADMIN.ORDER_DETAIL(id));
  },

  updateOrderStatus(id: string, status: OrderStatus): Promise<{ order: AdminOrderDto }> {
    return httpClient.patch<{ order: AdminOrderDto }>(API_PATHS.ADMIN.ORDER_STATUS(id), { status });
  },

  refundOrder(id: string, payload: { amount?: string }): Promise<{ order: AdminOrderDto }> {
    return httpClient.post<{ order: AdminOrderDto }>(API_PATHS.ADMIN.ORDER_REFUND(id), payload, {
      idempotencyKey: crypto.randomUUID(),
    });
  },

  vouchers(query: AdminPagedQuery = {}): Promise<PaginatedResponse<AdminVoucherDto>> {
    return httpClient.get<PaginatedResponse<AdminVoucherDto>>(API_PATHS.ADMIN.VOUCHERS, {
      params: toParams(query),
    });
  },

  createVoucher(payload: CreateVoucherRequest): Promise<{ voucher: AdminVoucherDto }> {
    return httpClient.post<{ voucher: AdminVoucherDto }>(API_PATHS.ADMIN.VOUCHERS, payload);
  },

  voucher(id: string): Promise<{ voucher: AdminVoucherDto }> {
    return httpClient.get<{ voucher: AdminVoucherDto }>(API_PATHS.ADMIN.VOUCHER_DETAIL(id));
  },

  updateVoucher(id: string, payload: UpdateVoucherRequest): Promise<{ voucher: AdminVoucherDto }> {
    return httpClient.patch<{ voucher: AdminVoucherDto }>(
      API_PATHS.ADMIN.VOUCHER_DETAIL(id),
      payload,
    );
  },

  deleteVoucher(id: string): Promise<{ deleted: boolean }> {
    return httpClient.delete<{ deleted: boolean }>(API_PATHS.ADMIN.VOUCHER_DETAIL(id));
  },
};

// ---------------------------------------------------------------------------
// Finance
// ---------------------------------------------------------------------------

export const adminFinanceApi = {
  paymentTransactions(query: AdminPaymentQuery = {}): Promise<
    PaginatedResponse<AdminPaymentTransactionDto>
  > {
    return httpClient.get<PaginatedResponse<AdminPaymentTransactionDto>>(
      API_PATHS.ADMIN.PAYMENT_TRANSACTIONS,
      { params: toParams(query) },
    );
  },

  paymentTransaction(id: string): Promise<{ paymentTransaction: AdminPaymentTransactionDto }> {
    return httpClient.get<{ paymentTransaction: AdminPaymentTransactionDto }>(
      API_PATHS.ADMIN.PAYMENT_TRANSACTION_DETAIL(id),
    );
  },

  walletLedgers(query: AdminWalletLedgerQuery = {}): Promise<
    PaginatedResponse<AdminWalletLedgerDto>
  > {
    return httpClient.get<PaginatedResponse<AdminWalletLedgerDto>>(
      API_PATHS.ADMIN.WALLET_LEDGERS,
      { params: toParams(query) },
    );
  },
};
