import { lazy } from 'react';

export const HomePage = lazy(() => import('../pages/HomePage'));
export const ProductsPage = lazy(() => import('../pages/ProductsPage'));
export const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
export const CartPage = lazy(() => import('../pages/CartPage'));
export const SupportPage = lazy(() => import('../pages/SupportPage'));
export const PolicyPage = lazy(() => import('../pages/PolicyPage'));
export const ContactPage = lazy(() => import('../pages/ContactPage'));
export const LoginPage = lazy(() => import('../pages/LoginPage'));
export const RegisterPage = lazy(() => import('../pages/RegisterPage'));
export const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
export const CashbackCenterPage = lazy(() => import('../pages/cashback/CashbackCenterPage'));
export const CashbackLinkPage = lazy(() => import('../pages/cashback/CashbackLinkPage'));
export const CashbackWalletPage = lazy(() => import('../pages/cashback/CashbackWalletPage'));
export const CashbackOrdersPage = lazy(() => import('../pages/cashback/CashbackOrdersPage'));
export const CashbackWithdrawalsPage = lazy(() => import('../pages/cashback/CashbackWithdrawalsPage'));
export const CashbackReferralsPage = lazy(() => import('../pages/cashback/CashbackReferralsPage'));

// Admin pages
export const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
export const AdminAccountsPage = lazy(() => import('../pages/admin/AdminAccountsPage'));
export const AdminCatalogPage = lazy(() => import('../pages/admin/AdminCatalogPage'));
export const AdminInventoryPage = lazy(() => import('../pages/admin/AdminInventoryPage'));
export const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'));
export const AdminVouchersPage = lazy(() => import('../pages/admin/AdminVouchersPage'));
export const AdminFinancePage = lazy(() => import('../pages/admin/AdminFinancePage'));
export const AdminAuditLogsPage = lazy(() => import('../pages/admin/AdminAuditLogsPage'));
