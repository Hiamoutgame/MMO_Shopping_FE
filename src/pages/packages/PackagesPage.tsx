import { useState, useEffect } from 'react';
import { packagesAPI, seasonsAPI } from '../../services/api';
import type { Package, Season } from '../../types/chung-suc.types';

interface PackageCardProps {
  package: Package;
  onSelect?: (packageId: string) => void;
}

function PackageCard({ package: pkg, onSelect }: PackageCardProps) {
  const displayPrice = parseFloat(pkg.displayPrice);
  const unitPrice = parseFloat(pkg.unitPrice);
  const savings = ((displayPrice * pkg.quantity - unitPrice * pkg.quantity) / (displayPrice * pkg.quantity)) * 100;

  return (
    <div className="package-card">
      <div className="package-header">
        <h3>{pkg.name}</h3>
        {savings > 0 && (
          <span className="savings-badge">
            Tiết kiệm {savings.toFixed(0)}%
          </span>
        )}
      </div>

      {pkg.description && (
        <p className="package-description">{pkg.description}</p>
      )}

      <div className="package-quantity">
        <div className="quantity-icon">📦</div>
        <div className="quantity-text">
          <span className="quantity-number">{pkg.quantity}</span>
          <span className="quantity-label">sản phẩm</span>
        </div>
      </div>

      <div className="package-pricing">
        {displayPrice !== unitPrice && (
          <div className="original-price">
            {(displayPrice * pkg.quantity).toLocaleString('vi-VN')} ₫
          </div>
        )}
        <div className="package-price">
          {(unitPrice * pkg.quantity).toLocaleString('vi-VN')} ₫
        </div>
        <div className="unit-price">
          {unitPrice.toLocaleString('vi-VN')} ₫/sản phẩm
        </div>
      </div>

      <div className="package-roles">
        <span className="roles-label">Dành cho:</span>
        <div className="roles-list">
          {pkg.applicableRoles.map((role) => (
            <span key={role} className={`role-chip ${role.toLowerCase()}`}>
              {role}
            </span>
          ))}
        </div>
      </div>

      {onSelect && (
        <button
          className="btn-select-package"
          onClick={() => onSelect(pkg.id)}
        >
          Chọn gói này
        </button>
      )}
    </div>
  );
}

export function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadSeasons();
  }, []);

  useEffect(() => {
    loadPackages();
  }, [selectedSeason]);

  const loadSeasons = async () => {
    try {
      const response = await seasonsAPI.getAll();
      setSeasons(response.data.filter((s: Season) => s.status === 'ACTIVE'));
    } catch (err: any) {
      console.error('Failed to load seasons:', err);
    }
  };

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      if (selectedSeason === 'all') {
        response = await packagesAPI.getAll();
      } else {
        response = await packagesAPI.getBySeason(selectedSeason);
      }

      const filteredPackages = response.data.filter((pkg: Package) => {
        if (!pkg.isActive) return false;
        if (!user.roleCode) return pkg.applicableRoles.includes('USER');
        return pkg.applicableRoles.includes(user.roleCode);
      });

      setPackages(filteredPackages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách gói');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (packageId: string) => {
    window.location.href = `/packages/${packageId}/checkout`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Đang tải gói...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={loadPackages}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="packages-page">
      <header className="page-header">
        <h1>📦 Gói Sản Phẩm</h1>
        <p className="page-subtitle">
          Mua theo gói để nhận giá ưu đãi tốt nhất
        </p>
      </header>

      {seasons.length > 0 && (
        <div className="season-filter">
          <button
            className={`filter-chip ${selectedSeason === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedSeason('all')}
          >
            Tất cả
          </button>
          {seasons.map((season) => (
            <button
              key={season.id}
              className={`filter-chip ${selectedSeason === season.id ? 'active' : ''}`}
              onClick={() => setSelectedSeason(season.id)}
            >
              {season.name}
            </button>
          ))}
        </div>
      )}

      {packages.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có gói nào phù hợp với tài khoản của bạn</p>
        </div>
      ) : (
        <div className="packages-grid">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              onSelect={handleSelectPackage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
