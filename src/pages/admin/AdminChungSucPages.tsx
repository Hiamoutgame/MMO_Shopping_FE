import { useState, useEffect } from 'react';
import { seasonsAPI, chungSucAPI } from '../../services/api';
import type { Season, ChungSucCampaign } from '../../types/chung-suc.types';

export function AdminSeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    bannerUrl: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadSeasons();
  }, []);

  const loadSeasons = async () => {
    try {
      setLoading(true);
      const response = await seasonsAPI.getAll();
      setSeasons(response.data);
    } catch (error) {
      console.error('Failed to load seasons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSeason(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      bannerUrl: '',
      startDate: '',
      endDate: '',
    });
    setShowModal(true);
  };

  const handleEdit = (season: Season) => {
    setEditingSeason(season);
    setFormData({
      name: season.name,
      slug: season.slug,
      description: season.description,
      bannerUrl: season.bannerUrl || '',
      startDate: season.startDate.split('T')[0],
      endDate: season.endDate.split('T')[0],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSeason) {
        await seasonsAPI.update(editingSeason.id, formData);
      } else {
        await seasonsAPI.create(formData);
      }
      setShowModal(false);
      loadSeasons();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleStatusChange = async (id: string, action: 'activate' | 'pause' | 'end') => {
    try {
      await seasonsAPI[action](id);
      loadSeasons();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa season này?')) return;
    try {
      await seasonsAPI.delete(id);
      loadSeasons();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Xóa thất bại');
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-500',
    UPCOMING: 'bg-blue-500',
    ACTIVE: 'bg-emerald-500',
    PAUSED: 'bg-amber-500',
    ENDED: 'bg-red-500',
    ARCHIVED: 'bg-gray-700',
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Quản lý Season/Event</h1>
        <button onClick={handleCreate} className="btn-primary">
          + Tạo Season mới
        </button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên Season</th>
                <th>Slug</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {seasons.map((season) => (
                <tr key={season.id}>
                  <td>{season.name}</td>
                  <td><code>{season.slug}</code></td>
                  <td>
                    <div className="date-range">
                      <div>{new Date(season.startDate).toLocaleDateString('vi-VN')}</div>
                      <div>→</div>
                      <div>{new Date(season.endDate).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${statusColors[season.status]}`}>
                      {season.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEdit(season)} className="btn-edit">
                        Sửa
                      </button>
                      {season.status === 'DRAFT' && (
                        <button
                          onClick={() => handleStatusChange(season.id, 'activate')}
                          className="btn-success"
                        >
                          Kích hoạt
                        </button>
                      )}
                      {season.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(season.id, 'pause')}
                            className="btn-warning"
                          >
                            Tạm dừng
                          </button>
                          <button
                            onClick={() => handleStatusChange(season.id, 'end')}
                            className="btn-danger"
                          >
                            Kết thúc
                          </button>
                        </>
                      )}
                      {season.status === 'PAUSED' && (
                        <button
                          onClick={() => handleStatusChange(season.id, 'activate')}
                          className="btn-success"
                        >
                          Tiếp tục
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(season.id)}
                        className="btn-danger"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingSeason ? 'Sửa Season' : 'Tạo Season mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên Season:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Slug:</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Mô tả:</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>URL Banner:</label>
                <input
                  type="url"
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu:</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Ngày kết thúc:</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {editingSeason ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminChungSucPage() {
  const [campaigns, setCampaigns] = useState<ChungSucCampaign[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<ChungSucCampaign | null>(null);

  const [formData, setFormData] = useState({
    seasonId: '',
    productId: '',
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    targetQuantity: 100,
    startTime: '',
    endTime: '',
    rewards: '{}',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campaignsRes, seasonsRes] = await Promise.all([
        chungSucAPI.getCampaigns(),
        seasonsAPI.getAll(),
      ]);
      setCampaigns(campaignsRes.data);
      setSeasons(seasonsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCampaign(null);
    setFormData({
      seasonId: '',
      productId: '',
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      targetQuantity: 100,
      startTime: '',
      endTime: '',
      rewards: '{}',
    });
    setShowModal(true);
  };

  const handleEdit = (campaign: ChungSucCampaign) => {
    setEditingCampaign(campaign);
    setFormData({
      seasonId: campaign.seasonId,
      productId: campaign.productId,
      name: campaign.name,
      slug: campaign.slug,
      description: campaign.description,
      imageUrl: campaign.imageUrl || '',
      targetQuantity: campaign.targetQuantity,
      startTime: campaign.startTime.split('T')[0],
      endTime: campaign.endTime.split('T')[0],
      rewards: JSON.stringify(campaign.rewards || {}, null, 2),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        rewards: JSON.parse(formData.rewards),
      };

      if (editingCampaign) {
        await chungSucAPI.updateCampaign(editingCampaign.id, data);
      } else {
        await chungSucAPI.createCampaign(data);
      }
      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-500',
    UPCOMING: 'bg-blue-500',
    ACTIVE: 'bg-emerald-500',
    PAUSED: 'bg-amber-500',
    COMPLETED: 'bg-green-600',
    ENDED: 'bg-red-500',
    CLOSED: 'bg-gray-700',
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Quản lý CHUNG SỨC Campaign</h1>
        <button onClick={handleCreate} className="btn-primary">
          + Tạo Campaign mới
        </button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên Campaign</th>
                <th>Season</th>
                <th>Tiến độ</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const progress = (campaign.currentQuantity / campaign.targetQuantity) * 100;
                return (
                  <tr key={campaign.id}>
                    <td>{campaign.name}</td>
                    <td>{campaign.season?.name || 'N/A'}</td>
                    <td>
                      <div className="progress-cell">
                        <div className="progress-bar-mini">
                          <div
                            className="progress-fill"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span>{campaign.currentQuantity} / {campaign.targetQuantity}</span>
                      </div>
                    </td>
                    <td>
                      <div className="date-range">
                        <div>{new Date(campaign.startTime).toLocaleDateString('vi-VN')}</div>
                        <div>→</div>
                        <div>{new Date(campaign.endTime).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${statusColors[campaign.status]}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(campaign)} className="btn-edit">
                          Sửa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCampaign ? 'Sửa Campaign' : 'Tạo Campaign mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Season:</label>
                  <select
                    required
                    value={formData.seasonId}
                    onChange={(e) => setFormData({ ...formData, seasonId: e.target.value })}
                  >
                    <option value="">-- Chọn Season --</option>
                    {seasons.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Product ID:</label>
                  <input
                    type="text"
                    required
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tên Campaign:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Slug:</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Mô tả:</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>URL Hình ảnh:</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Số lượng mục tiêu:</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.targetQuantity}
                  onChange={(e) => setFormData({ ...formData, targetQuantity: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu:</label>
                  <input
                    type="date"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Ngày kết thúc:</label>
                  <input
                    type="date"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Rewards (JSON):</label>
                <textarea
                  rows={5}
                  value={formData.rewards}
                  onChange={(e) => setFormData({ ...formData, rewards: e.target.value })}
                  placeholder='{"milestone50": "Tặng 5 account", "milestone100": "Giảm 5%"}'
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {editingCampaign ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
