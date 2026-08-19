import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { APP_CONSTANTS } from '../common/const/app';
import {
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#07080D',
        color: '#94A3B8',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid #162033CC',
            borderTopColor: '#0EA5FF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px auto',
          }}
        />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p>Đang tải dữ liệu...</p>
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path={APP_CONSTANTS.ROUTES.HOME} element={<Navigate to={APP_CONSTANTS.ROUTES.PRODUCTS} replace />} />
          <Route path={APP_CONSTANTS.ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route path={APP_CONSTANTS.ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />
          <Route path={APP_CONSTANTS.ROUTES.CART} element={<CartPage />} />
          <Route path={APP_CONSTANTS.ROUTES.SUPPORT} element={<SupportPage />} />
          <Route path={APP_CONSTANTS.ROUTES.POLICY} element={<PolicyPage />} />
          <Route path={APP_CONSTANTS.ROUTES.CONTACT} element={<ContactPage />} />
          <Route path={APP_CONSTANTS.ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={APP_CONSTANTS.ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
