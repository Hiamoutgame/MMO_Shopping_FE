import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { APP_CONSTANTS } from '../common/const/app';
import { MainLayout, AuthLayout, AdminLayout } from '../layouts';
import { RequireAuth } from '../components/RequireAuth/RequireAuth';
import { RequireAdmin } from '../components/RequireAdmin/RequireAdmin';
import { useSessionRestore } from '../hooks/useSessionRestore';
import {
  HomePage,
  ProductsPage,
  ProductDetailPage,
  CartPage,
  SupportPage,
  PolicyPage,
  ContactPage,
  LoginPage,
  RegisterPage,
  NotFoundPage,
  AdminDashboardPage,
  AdminAccountsPage,
  AdminCatalogPage,
  AdminInventoryPage,
  AdminOrdersPage,
  AdminVouchersPage,
  AdminFinancePage,
  AdminAuditLogsPage,
  CashbackCenterPage,
  CashbackLinkPage,
  CashbackWalletPage,
  CashbackOrdersPage,
  CashbackWithdrawalsPage,
  CashbackReferralsPage,
} from './lazyComponents';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#07080D] text-[#94A3B8] font-sans">
      <div className="text-center">
        <div className="w-9 h-9 border-4 border-[#162033CC] border-t-[#0EA5FF] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Đang tải dữ liệu...</p>
      </div>
    </div>
  );
}

function SessionRestoreBridge() {
  useSessionRestore();
  return null;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <SessionRestoreBridge />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Main Layout Routes */}
          <Route path={APP_CONSTANTS.ROUTES.HOME} element={<MainLayout pageTitle="TRANG CHỦ"><HomePage /></MainLayout>} />
          <Route path={APP_CONSTANTS.ROUTES.PRODUCTS} element={<MainLayout pageTitle="SẢN PHẨM"><ProductsPage /></MainLayout>} />
          <Route path={APP_CONSTANTS.ROUTES.PRODUCT_DETAIL} element={<MainLayout pageTitle="CHI TIẾT"><ProductDetailPage /></MainLayout>} />
          <Route path={APP_CONSTANTS.ROUTES.CART} element={<MainLayout pageTitle="GIỎ HÀNG"><RequireAuth><CartPage /></RequireAuth></MainLayout>} />
          <Route path={APP_CONSTANTS.ROUTES.SUPPORT} element={<MainLayout pageTitle="TIẾP SỨC"><RequireAuth><SupportPage /></RequireAuth></MainLayout>} />
          <Route path={APP_CONSTANTS.ROUTES.POLICY} element={<MainLayout pageTitle="CHÍNH SÁCH"><PolicyPage /></MainLayout>} />
          <Route path={APP_CONSTANTS.ROUTES.CONTACT} element={<MainLayout pageTitle="LIÊN HỆ"><ContactPage /></MainLayout>} />
          <Route path={APP_CONSTANTS.ROUTES.CASHBACK} element={<MainLayout pageTitle="HOÀN PHÍ"><RequireAuth><CashbackCenterPage /></RequireAuth></MainLayout>}>
            <Route index element={<CashbackLinkPage />} />
            <Route path="wallet" element={<CashbackWalletPage />} />
            <Route path="orders" element={<CashbackOrdersPage />} />
            <Route path="orders/:id" element={<CashbackOrdersPage />} />
            <Route path="withdrawals" element={<CashbackWithdrawalsPage />} />
            <Route path="referrals" element={<CashbackReferralsPage />} />
          </Route>
          
          {/* Auth Layout Routes */}
          <Route path={APP_CONSTANTS.ROUTES.LOGIN} element={<AuthLayout><LoginPage /></AuthLayout>} />
          <Route path={APP_CONSTANTS.ROUTES.REGISTER} element={<AuthLayout><RegisterPage /></AuthLayout>} />

          {/* Admin Layout Routes */}
          <Route path="/admin" element={<RequireAdmin><AdminLayout><AdminDashboardPage /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/accounts" element={<RequireAdmin><AdminLayout><AdminAccountsPage /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/catalog" element={<RequireAdmin><AdminLayout><AdminCatalogPage /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/inventory" element={<RequireAdmin><AdminLayout><AdminInventoryPage /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/orders" element={<RequireAdmin><AdminLayout><AdminOrdersPage /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/vouchers" element={<RequireAdmin><AdminLayout><AdminVouchersPage /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/finance" element={<RequireAdmin><AdminLayout><AdminFinancePage /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/audit-logs" element={<RequireAdmin><AdminLayout><AdminAuditLogsPage /></AdminLayout></RequireAdmin>} />

          {/* Fallback */}
          <Route path="*" element={<MainLayout pageTitle="404"><NotFoundPage /></MainLayout>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
