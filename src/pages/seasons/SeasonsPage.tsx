import { useState, useEffect } from 'react';
import { seasonsAPI } from '../../services/api';
import type { Season } from '../../types/chung-suc.types';

interface SeasonCardProps {
  season: Season;
  onViewCampaigns?: (seasonId: string) => void;
}

function SeasonCard({ season, onViewCampaigns }: SeasonCardProps) {
  const now = new Date();
  const startDate = new Date(season.startDate);
  const endDate = new Date(season.endDate);

  const isActive = season.status === 'ACTIVE' && now >= startDate && now <= endDate;
  const isUpcoming = season.status === 'UPCOMING' || (season.status === 'ACTIVE' && now < startDate);

  const daysRemaining = isActive
    ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-500',
    UPCOMING: 'bg-blue-500',
    ACTIVE: 'bg-emerald-500',
    PAUSED: 'bg-amber-500',
    ENDED: 'bg-red-500',
    ARCHIVED: 'bg-gray-700',
  };

  return (
    <div className="season-card">
      {season.bannerUrl && (
        <div
          className="season-banner"
          style={{ backgroundImage: `url(${season.bannerUrl})` }}
        />
      )}

      <div className="season-content">
        <div className="season-header">
          <h3>{season.name}</h3>
          <span className={`status-badge ${statusColors[season.status]}`}>
            {season.status}
          </span>
        </div>

        <p className="season-description">{season.description}</p>

        <div className="season-dates">
          <div className="date-item">
            <span className="date-label">Bắt đầu:</span>
            <span className="date-value">
              {startDate.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="date-separator">→</div>
          <div className="date-item">
            <span className="date-label">Kết thúc:</span>
            <span className="date-value">
              {endDate.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {isActive && daysRemaining !== null && (
          <div className="season-countdown">
            <span className="countdown-icon">⏰</span>
            <span className="countdown-text">
              Còn {daysRemaining} ngày
            </span>
          </div>
        )}

        {isUpcoming && (
          <div className="season-upcoming">
            <span className="upcoming-icon">🔔</span>
            <span className="upcoming-text">Sắp diễn ra</span>
          </div>
        )}

        {isActive && onViewCampaigns && (
          <button
            className="btn-view-campaigns"
            onClick={() => onViewCampaigns(season.id)}
          >
            Xem chiến dịch
          </button>
        )}
      </div>
    </div>
  );
}

export function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSeasons();
  }, []);

  const loadSeasons = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await seasonsAPI.getAll();
      setSeasons(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách season');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCampaigns = (seasonId: string) => {
    window.location.href = `/chung-suc?season=${seasonId}`;
  };

  const filteredSeasons = seasons.filter((season) => {
    if (filter === 'all') return true;
    if (filter === 'active') return season.status === 'ACTIVE';
    if (filter === 'upcoming') return season.status === 'UPCOMING' || season.status === 'DRAFT';
    return true;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Đang tải seasons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={loadSeasons}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="seasons-page">
      <header className="page-header">
        <h1>🎊 Seasons & Events</h1>
        <p className="page-subtitle">
          Khám phá các chương trình khuyến mãi theo mùa
        </p>
      </header>

      <div className="filter-bar">
        <button
          className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả
        </button>
        <button
          className={`filter-chip ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Đang diễn ra
        </button>
        <button
          className={`filter-chip ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Sắp tới
        </button>
      </div>

      {filteredSeasons.length === 0 ? (
        <div className="empty-state">
          <p>Không có season nào phù hợp</p>
        </div>
      ) : (
        <div className="seasons-grid">
          {filteredSeasons.map((season) => (
            <SeasonCard
              key={season.id}
              season={season}
              onViewCampaigns={handleViewCampaigns}
            />
          ))}
        </div>
      )}
    </div>
  );
}
