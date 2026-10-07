import { useState, useEffect } from 'react';
import { chungSucAPI } from '../../services/api.ts';
import type { ChungSucCampaign } from '../../types/chung-suc.types.ts';

interface CampaignCardProps {
  campaign: ChungSucCampaign;
  onJoin?: (campaignId: string) => void;
}

export function CampaignCard({ campaign, onJoin }: CampaignCardProps) {
  const progress = (campaign.currentQuantity / campaign.targetQuantity) * 100;
  const remaining = campaign.targetQuantity - campaign.currentQuantity;
  const isCompleted = campaign.currentQuantity >= campaign.targetQuantity;
  const isActive = campaign.status === 'ACTIVE';

  const statusColor = {
    ACTIVE: 'bg-emerald-500',
    COMPLETED: 'bg-blue-500',
    ENDED: 'bg-gray-500',
    PAUSED: 'bg-amber-500',
  }[campaign.status] || 'bg-gray-400';

  return (
    <div className="campaign-card">
      {campaign.imageUrl && (
        <img src={campaign.imageUrl} alt={campaign.name} className="campaign-image" />
      )}

      <div className="campaign-header">
        <h3>{campaign.name}</h3>
        <span className={`status-badge ${statusColor}`}>
          {campaign.status}
        </span>
      </div>

      <p className="campaign-description">{campaign.description}</p>

      <div className="campaign-progress">
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="progress-stats">
          <span>{campaign.currentQuantity} / {campaign.targetQuantity}</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
      </div>

      <div className="campaign-info">
        <div className="info-item">
          <span className="label">Còn lại:</span>
          <span className="value">{remaining > 0 ? remaining : 0} sản phẩm</span>
        </div>
        <div className="info-item">
          <span className="label">Kết thúc:</span>
          <span className="value">
            {new Date(campaign.endTime).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>

      {campaign.rewards && Object.keys(campaign.rewards).length > 0 && (
        <div className="campaign-rewards">
          <h4>🎁 Phần thưởng:</h4>
          <ul>
            {Object.entries(campaign.rewards).map(([key, value]) => (
              <li key={key}>{value as string}</li>
            ))}
          </ul>
        </div>
      )}

      {isActive && !isCompleted && onJoin && (
        <button
          className="btn-join-campaign"
          onClick={() => onJoin(campaign.id)}
        >
          Tham gia ngay
        </button>
      )}

      {isCompleted && (
        <div className="campaign-completed">
          ✅ Đã đạt mục tiêu!
        </div>
      )}
    </div>
  );
}

export function ChungSucCampaignsPage() {
  const [campaigns, setCampaigns] = useState<ChungSucCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await chungSucAPI.getActiveCampaigns();
      setCampaigns(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách chiến dịch');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCampaign = (campaignId: string) => {
    // Redirect to join page with campaign ID
    window.location.href = `/chung-suc/${campaignId}/join`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Đang tải chiến dịch...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={loadCampaigns}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="chung-suc-page">
      <header className="page-header">
        <h1>🎯 CHUNG SỨC - Mua Chung Giá Tốt</h1>
        <p className="page-subtitle">
          Cùng nhau mua số lượng lớn để được giá cực ưu đãi
        </p>
      </header>

      {campaigns.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có chiến dịch nào đang hoạt động</p>
        </div>
      ) : (
        <div className="campaigns-grid">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onJoin={handleJoinCampaign}
            />
          ))}
        </div>
      )}
    </div>
  );
}
