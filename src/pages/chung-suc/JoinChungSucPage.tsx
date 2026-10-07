import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chungSucAPI, pricingAPI } from '../../services/api';
import type { ChungSucCampaign, PriceCalculationResult } from '../../types/chung-suc.types';

export function JoinChungSucPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<ChungSucCampaign | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sellerCode, setSellerCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [priceResult, setPriceResult] = useState<PriceCalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (campaignId) {
      loadCampaign();
    }
  }, [campaignId]);

  useEffect(() => {
    if (campaign && user.id) {
      calculatePrice();
    }
  }, [campaign, quantity, sellerCode, couponCode]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const response = await chungSucAPI.getCampaignById(campaignId!);
      setCampaign(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải thông tin chiến dịch');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = async () => {
    if (!campaign || !user.id) return;

    try {
      setCalculating(true);
      const response = await pricingAPI.calculate({
        productId: campaign.productId,
        accountId: user.id,
        quantity,
        seasonId: campaign.seasonId,
        sellerCode: sellerCode || undefined,
        couponCode: couponCode || undefined,
      });
      setPriceResult(response.data);
    } catch (err: any) {
      console.error('Price calculation error:', err);
    } finally {
      setCalculating(false);
    }
  };

  const handleJoin = async () => {
    if (!campaign || !user.id) return;

    try {
      setSubmitting(true);
      setError('');
      await chungSucAPI.joinCampaign(campaign.id, user.id, quantity);
      alert('✅ Tham gia chiến dịch thành công!');
      navigate('/chung-suc');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tham gia chiến dịch');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  if (!campaign) {
    return <div className="error-container">Không tìm thấy chiến dịch</div>;
  }

  const progress = (campaign.currentQuantity / campaign.targetQuantity) * 100;

  return (
    <div className="join-campaign-page">
      <div className="campaign-summary">
        <h1>{campaign.name}</h1>
        <p>{campaign.description}</p>

        <div className="progress-section">
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="progress-text">
            <span>{campaign.currentQuantity} / {campaign.targetQuantity}</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="join-form">
        <h2>Thông tin đặt hàng</h2>

        <div className="form-group">
          <label>Số lượng:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="input-number"
          />
        </div>

        <div className="form-group">
          <label>Mã giới thiệu Seller (tùy chọn):</label>
          <input
            type="text"
            placeholder="VD: SELLER2024"
            value={sellerCode}
            onChange={(e) => setSellerCode(e.target.value.toUpperCase())}
            className="input-text"
          />
        </div>

        <div className="form-group">
          <label>Mã giảm giá (tùy chọn):</label>
          <input
            type="text"
            placeholder="VD: TET2024"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="input-text"
          />
        </div>

        {calculating && <div className="calculating">Đang tính giá...</div>}

        {priceResult && (
          <div className="price-breakdown">
            <h3>Chi tiết giá</h3>

            {priceResult.breakdown.map((item, index) => (
              <div key={index} className="breakdown-item">
                <div className="breakdown-step">{item.step}</div>
                <div className="breakdown-description">{item.description}</div>
                <div className="breakdown-amount">
                  {parseFloat(item.amount).toLocaleString('vi-VN')} ₫
                </div>
                {item.discountAmount && (
                  <div className="breakdown-discount">
                    -{parseFloat(item.discountAmount).toLocaleString('vi-VN')} ₫
                    ({item.discountPercentage}%)
                  </div>
                )}
              </div>
            ))}

            <div className="price-summary">
              <div className="summary-row">
                <span>Giá gốc:</span>
                <span>{parseFloat(priceResult.basePrice).toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="summary-row">
                <span>Tổng giảm:</span>
                <span className="discount">
                  -{parseFloat(priceResult.totalDiscount).toLocaleString('vi-VN')} ₫
                  ({priceResult.discountPercentage}%)
                </span>
              </div>
              <div className="summary-row total">
                <span>Đơn giá cuối:</span>
                <span className="final-price">
                  {parseFloat(priceResult.finalPrice).toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <div className="summary-row grand-total">
                <span>Tổng thanh toán ({quantity} sản phẩm):</span>
                <span className="grand-total-price">
                  {(parseFloat(priceResult.finalPrice) * quantity).toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            {priceResult.floorEnforced && (
              <div className="floor-notice">
                ⚠️ Giá đã được điều chỉnh lên mức tối thiểu: {parseFloat(priceResult.priceFloor!).toLocaleString('vi-VN')} ₫
              </div>
            )}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleJoin}
          disabled={submitting || !priceResult}
          className="btn-submit"
        >
          {submitting ? 'Đang xử lý...' : 'Xác nhận tham gia'}
        </button>
      </div>
    </div>
  );
}
