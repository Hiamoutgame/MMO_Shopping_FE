import type { Money, PaginatedResponse } from './common';

// ---------------------------------------------------------------------------
// Shared pagination query
// ---------------------------------------------------------------------------

export interface AdminPagedQuery {
  page?: number;
  pageSize?: number;
}

// ---------------------------------------------------------------------------
// System: dashboard / report / audit
// ---------------------------------------------------------------------------

export interface RangeMetricsDto {
  revenue: { gross: Money; refunded: Money; net: Money; currency: string };
  orders: { total: number; paid: number; byStatus: Record<string, number> };
  users: { new: number };
  productViews: { total: number; authenticated: number; anonymous: number };
  supportCodeRequests: { total: number; byStatus: Record<string, number> };
}

export interface InventorySnapshotDto {
  total: number;
  byStatus: Record<string, number>;
}

export interface DashboardOverviewDto {
  last24Hours: RangeMetricsDto;
  last30Days: RangeMetricsDto;
  current: {
    users: { total: number };
    orders: { pending: number; processing: number };
    inventory: InventorySnapshotDto;
    supportCodeRequests: { total: number; byStatus: Record<string, number> };
  };
}

export interface ReportSummaryDto {
  period: { from: string; to: string; timezone: string };
  revenue: { gross: Money; refunded: Money; net: Money; currency: string };
  orders: { total: number; paid: number; byStatus: Record<string, number> };
  users: { total: number; new: number };
  inventory: InventorySnapshotDto;
  productViews: { total: number; authenticated: number; anonymous: number };
  supportCodeRequests: { total: number; byStatus: Record<string, number> };
}

export interface AuditLogDto {
  id: string;
  actor: { id: string; email: string; name: string | null } | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditLogQuery extends AdminPagedQuery {
  actorId?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
}

// ---------------------------------------------------------------------------
// Identity: accounts / roles
// ---------------------------------------------------------------------------

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface AdminRoleDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export interface AdminAccountDto {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  status: AccountStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  role: AdminRoleDto | null;
}

export interface AdminAccountQuery extends AdminPagedQuery {
  search?: string;
  role?: string;
  status?: AccountStatus;
}

export interface CreateAccountRequest {
  email: string;
  password: string;
  roleCode: string;
  displayName?: string;
  phone?: string;
  status?: AccountStatus;
}

export interface UpdateAccountRequest {
  email?: string;
  password?: string;
  roleCode?: string;
  displayName?: string;
  phone?: string;
  status?: AccountStatus;
}

// ---------------------------------------------------------------------------
// Catalog: categories / products / variants
// ---------------------------------------------------------------------------

export type CategoryStatus = 'ACTIVE' | 'INACTIVE';
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';
export type VariantStatus = 'ACTIVE' | 'INACTIVE';
export type FulfillmentType = 'AUTO' | 'MANUAL' | 'EXTERNAL';

export interface AdminCategoryDto {
  id: string;
  name: string;
  slug: string;
  status: CategoryStatus;
  description: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminVariantDto {
  id: string;
  sku: string;
  name: string;
  price: Money;
  currency: string;
  status: VariantStatus;
  fulfillmentType: FulfillmentType;
  warrantyDays: number | null;
  availableQuantity: number;
}

export interface AdminProductDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrls: string[] | null;
  status: ProductStatus;
  primaryCategory: { id: string; name: string; slug: string } | null;
  categories: { id: string; name: string; slug: string }[];
  variants: AdminVariantDto[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategoryQuery extends AdminPagedQuery {
  search?: string;
  status?: CategoryStatus;
}

export interface AdminProductQuery extends AdminPagedQuery {
  search?: string;
  status?: ProductStatus;
  categoryId?: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  parentId?: string | null;
  status?: CategoryStatus;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  parentId?: string | null;
  status?: CategoryStatus;
  description?: string;
}

export interface CreateProductRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrls?: string[];
  categoryIds?: string[];
  primaryCategoryId?: string | null;
  status?: ProductStatus;
}

export interface UpdateProductRequest {
  name?: string;
  slug?: string;
  description?: string;
  imageUrls?: string[];
  categoryIds?: string[];
  primaryCategoryId?: string | null;
  status?: ProductStatus;
}

export interface CreateVariantRequest {
  sku: string;
  name: string;
  price: string;
  currency?: string;
  status?: VariantStatus;
  fulfillmentType: FulfillmentType;
  warrantyDays?: number | null;
}

export interface UpdateVariantRequest {
  name?: string;
  price?: string;
  status?: VariantStatus;
  fulfillmentType?: FulfillmentType;
  warrantyDays?: number | null;
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export type InventoryStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'VOID';

export interface AdminInventoryItemDto {
  id: string;
  productVariantId: string;
  orderItemId: string | null;
  status: InventoryStatus;
  reservedUntil: string | null;
  soldAt: string | null;
  metadata: Record<string, unknown> | null;
  encryptionKeyVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminInventoryQuery extends AdminPagedQuery {
  status?: InventoryStatus;
  productVariantId?: string;
}

export interface CreateInventoryItemRequest {
  productVariantId: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UpdateInventoryItemRequest {
  productVariantId?: string;
  payload?: Record<string, unknown>;
  status?: InventoryStatus;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Commerce: orders / vouchers
// ---------------------------------------------------------------------------

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface AdminOrderItemDto {
  id: string;
  productVariantId: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: Money;
  quantity: number;
  totalAmount: Money;
  warrantyExpiresAt: string | null;
}

export interface AdminOrderDto {
  id: string;
  accountId: string;
  voucherId: string | null;
  orderNumber: string;
  orderType: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: Money;
  discountAmount: Money;
  totalAmount: Money;
  refundedAmount: Money;
  currency: string;
  placedAt: string;
  items: AdminOrderItemDto[];
}

export interface AdminOrderQuery extends AdminPagedQuery {
  accountId?: string;
  status?: OrderStatus;
}

export interface AdminVoucherDto {
  id: string;
  code: string;
  name: string;
  discountType: DiscountType;
  discountValue: Money;
  minimumOrderAmount: Money | null;
  maximumDiscountAmount: Money | null;
  usageLimit: number;
  perAccountLimit: number;
  usedCount: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVoucherRequest {
  code: string;
  name: string;
  discountType: DiscountType;
  discountValue: string;
  minimumOrderAmount?: string;
  maximumDiscountAmount?: string;
  usageLimit: number;
  perAccountLimit?: number;
  startsAt: string;
  endsAt: string;
  isActive?: boolean;
}

export interface UpdateVoucherRequest {
  code?: string;
  name?: string;
  discountType?: DiscountType;
  discountValue?: string;
  minimumOrderAmount?: string | null;
  maximumDiscountAmount?: string | null;
  usageLimit?: number;
  perAccountLimit?: number;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
}

// ---------------------------------------------------------------------------
// Finance: payment transactions / wallet ledgers
// ---------------------------------------------------------------------------

export type PaymentTransactionStatus =
  | 'PENDING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED';

export type WalletTransactionType = 'CREDIT' | 'DEBIT';

export interface AdminPaymentTransactionDto {
  id: string;
  accountId: string;
  provider: string;
  merchantReference: string;
  providerTransactionId: string | null;
  type: string;
  amount: Money;
  currency: string;
  status: PaymentTransactionStatus;
  metadata: Record<string, unknown> | null;
  completedAt: string | null;
  createdAt: string;
}

export interface AdminWalletLedgerDto {
  id: string;
  walletId: string;
  orderId: string | null;
  paymentTransactionId: string | null;
  type: WalletTransactionType;
  amount: Money;
  balanceBefore: Money;
  balanceAfter: Money;
  status: string;
  purpose: string;
  description: string | null;
  createdAt: string;
}

export interface AdminPaymentQuery extends AdminPagedQuery {
  accountId?: string;
  status?: PaymentTransactionStatus;
}

export interface AdminWalletLedgerQuery extends AdminPagedQuery {
  accountId?: string;
}

// ---------------------------------------------------------------------------
// Pagination aliases for readability in pages
// ---------------------------------------------------------------------------

export type AdminPaged<T> = PaginatedResponse<T>;
