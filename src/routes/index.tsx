import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { APP_CONSTANTS } from '../common/const/app';
import { MainLayout, AuthLayout } from '../layouts';
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

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Main Layout Routes */}
          <Route path={APP_CONSTANTS.ROUTES.HOME} element={<MainLayout pageTitle="TRANG CHỦ"><HomePage /></MainLayout>} />
          <Route path={APP_CONSTANTS.ROUTES.PRODUCTS} element={<MainLayout pageTitle="SẢN PHẨM"><ProductsPage /></MainLayout>} />
          <Route path={APP_CONSTANTS.ROUTES.PRODUCT_DETAIL} element={<MainLayout pageTitle="CHI TIẾT"><ProductDetailPage /></MainLayout>} />
          <Route path={APP_CONSTANTS.ROUTES.CART} element={<MainLayout pageTitle="GIỎ HÀNG"><CartPage /></MainLayout>} />
          <Route path={APP_CONSTANTS.ROUTES.SUPPORT} element={<MainLayout pageTitle="TIẾP SỨC"><SupportPage /></MainLayout>} />
          <Route path={APP_CONSTANTS.ROUTES.POLICY} element={<MainLayout pageTitle="CHÍNH SÁCH"><PolicyPage /></MainLayout>} />
          <Route path={APP_CONSTANTS.ROUTES.CONTACT} element={<MainLayout pageTitle="LIÊN HỆ"><ContactPage /></MainLayout>} />
          
          {/* Auth Layout Routes */}
          <Route path={APP_CONSTANTS.ROUTES.LOGIN} element={<AuthLayout><LoginPage /></AuthLayout>} />
          <Route path={APP_CONSTANTS.ROUTES.REGISTER} element={<AuthLayout><RegisterPage /></AuthLayout>} />
          
          {/* Fallback */}
          <Route path="*" element={<MainLayout pageTitle="404"><NotFoundPage /></MainLayout>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
