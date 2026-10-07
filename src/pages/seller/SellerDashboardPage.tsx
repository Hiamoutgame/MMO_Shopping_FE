import { useState, useEffect } from 'react';
import { sellersAPI } from '../../services/api';
import type { SellerProfile, SellerReferralCode } from '../../types/chung-suc.types';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {trend && (
          <div className={`stat-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}

export function SellerDashboardPage() {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [referralCodes, setReferralCodes] = useState<SellerReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCode, setShowCreateCode] = useState(false);
  const [newCode, setNewCode] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [profileRes, codesRes] = await Promise.all([
        sellersAPI.getProfile(user.id),
        sellersAPI.getReferralCodes(user.id),
      ]);
      setProfile(profileRes.data);
      setReferralCodes(codesRes.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async () => {
    if (!newCode.trim()) {
      alert('Vui lòng nhập mã giới thiệu');
      return;
    }

    try {
      await sellersAPI.createReferralCode(user.id, newCode.toUpperCase());
      setShowCreateCode(false);
      setNewCode('');
      loadDashboard();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể tạo mã giới thiệu');
    }
  };

  const handleToggleCode = async (codeId: string, isActive: boolean) => {
    try {
      await sellersAPI.toggleReferralCode(codeId, !isActive);
      loadDashboard();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Đã sao chép mã: ' + code);
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  if (!profile) {
    return (
      <div className="error-container">
        <p>Không tìm thấy thông tin seller</p>
      </div>
    );
  }

  const totalSales = parseFloat(profile.totalSales);
  const totalCommission = parseFloat(profile.totalCommission);

  return (
    <div className="seller-dashboard">
      <header className="page-header">
        <h1>📊 Dashboard Seller</h1>
        <p className="page-subtitle">Quản lý doanh số và mã giới thiệu</p>
      </header>

      <div className="profile-section">
        <div className="profile-card">
          <h2>{profile.businessName}</h2>
          <div className="profile-meta">
            <span className={`status-badge ${profile.approvalStatus === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
              {profile.approvalStatus}
            </span>
            <span className="commission-rate">
              Hoa hồng: {(profile.commissionRate * 100).toFixed(1)}%
            </span>
          </div>
          {profile.businessType && (
            <div className="profile-info">
              <span className="label">Loại hình:</span>
              <span className="value">{profile.businessType}</span>
            </div>
          )}
          {profile.phoneNumber && (
            <div className="profile-info">
              <span className="label">Điện thoại:</span>
              <span className="value">{profile.phoneNumber}</span>
            </div>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Tổng doanh số"
          value={`${totalSales.toLocaleString('vi-VN')} ₫`}
          icon="💰"
        />
        <StatCard
          label="Hoa hồng đã nhận"
          value={`${totalCommission.toLocaleString('vi-VN')} ₫`}
          icon="🎁"
        />
        <StatCard
          label="Số mã giới thiệu"
          value={referralCodes.length}
          icon="🔗"
        />
        <StatCard
          label="Tổng lượt sử dụng"
          value={referralCodes.reduce((sum, code) => sum + code.usageCount, 0)}
          icon="📈"
        />
      </div>

      <div className="referral-section">
        <div className="section-header">
          <h2>Mã giới thiệu</h2>
          <button onClick={() => setShowCreateCode(true)} className="btn-primary">
            + Tạo mã mới
          </button>
        </div>

        {referralCodes.length === 0 ? (
          <div className="empty-state">
            <p>Bạn chưa có mã giới thiệu nào</p>
          </div>
        ) : (
          <div className="codes-grid">
            {referralCodes.map((code) => (
              <div key={code.id} className="code-card">
                <div className="code-header">
                  <code className="code-value">{code.code}</code>
                  <span className={`status-badge ${code.isActive ? 'bg-emerald-500' : 'bg-gray-500'}`}>
                    {code.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <div className="code-stats">
                  <div className="code-stat">
                    <span className="label">Lượt sử dụng:</span>
                    <span className="value">{code.usageCount}</span>
                  </div>
                  <div className="code-stat">
                    <span className="label">Tạo lúc:</span>
                    <span className="value">
                      {new Date(code.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="code-actions">
                  <button
                    onClick={() => copyToClipboard(code.code)}
                    className="btn-secondary"
                  >
                    📋 Sao chép
                  </button>
                  <button
                    onClick={() => handleToggleCode(code.id, code.isActive)}
                    className={code.isActive ? 'btn-warning' : 'btn-success'}
                  >
                    {code.isActive ? 'Tắt' : 'Bật'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateCode && (
        <div className="modal-overlay" onClick={() => setShowCreateCode(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Tạo mã giới thiệu mới</h2>
            <div className="form-group">
              <label>Mã giới thiệu:</label>
              <input
                type="text"
                placeholder="VD: SELLER2024"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                maxLength={20}
                className="input-text"
              />
              <p className="help-text">
                Chỉ sử dụng chữ cái và số, tối đa 20 ký tự
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setShowCreateCode(false)}
                className="btn-secondary"
              >
                Hủy
              </button>
              <button onClick={handleCreateCode} className="btn-primary">
                Tạo mã
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
