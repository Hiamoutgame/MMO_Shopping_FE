import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ChungSucCampaignsPage } from './pages/chung-suc/ChungSucCampaignsPage';
import { JoinChungSucPage } from './pages/chung-suc/JoinChungSucPage';
import { PackagesPage } from './pages/packages/PackagesPage';
import { SeasonsPage } from './pages/seasons/SeasonsPage';
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage';
import { AdminSeasonsPage, AdminChungSucPage } from './pages/admin/AdminChungSucPages';
import './styles/chung-suc.css';
import './styles/auth.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userStr) {
    const user = JSON.parse(userStr);
    if (!requiredRole.includes(user.roleCode)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChungSucCampaignsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chung-suc"
          element={
            <ProtectedRoute>
              <ChungSucCampaignsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chung-suc/:campaignId/join"
          element={
            <ProtectedRoute>
              <JoinChungSucPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/packages"
          element={
            <ProtectedRoute>
              <PackagesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seasons"
          element={
            <ProtectedRoute>
              <SeasonsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute requiredRole={['SELLER', 'ADMIN']}>
              <SellerDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/seasons"
          element={
            <ProtectedRoute requiredRole={['ADMIN']}>
              <AdminSeasonsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/campaigns"
          element={
            <ProtectedRoute requiredRole={['ADMIN']}>
              <AdminChungSucPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
