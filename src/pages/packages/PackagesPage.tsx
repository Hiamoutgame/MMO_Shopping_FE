import { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { packagesAPI, seasonsAPI } from '../../services/api';
import type { Package, Season } from '../../types/chung-suc.types';

function errorMessage(err: unknown, fallback: string): string {
  return (isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || fallback;
}

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
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    seasonsAPI
      .getAll()
      .then((response) => {
        if (!cancelled) setSeasons(response.data.filter((s: Season) => s.status === 'ACTIVE'));
      })
      .catch((err: unknown) => console.error('Failed to load seasons:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const request =
      selectedSeason === 'all' ? packagesAPI.getAll() : packagesAPI.getBySeason(selectedSeason);

    request
      .then((response) => {
        if (cancelled) return;
        setPackages(
          response.data.filter((pkg: Package) => {
            if (!pkg.isActive) return false;
            if (!user.roleCode) return pkg.applicableRoles.includes('USER');
            return pkg.applicableRoles.includes(user.roleCode);
          }),
        );
        setError('');
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, 'Không thể tải danh sách gói'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedSeason, reloadKey]);

  const selectSeason = (seasonId: string) => {
    setLoading(true);
    setSelectedSeason(seasonId);
  };

  const retry = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
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
        <button onClick={retry}>Thử lại</button>
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
            onClick={() => selectSeason('all')}
          >
            Tất cả
          </button>
          {seasons.map((season) => (
            <button
              key={season.id}
              className={`filter-chip ${selectedSeason === season.id ? 'active' : ''}`}
              onClick={() => selectSeason(season.id)}
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
