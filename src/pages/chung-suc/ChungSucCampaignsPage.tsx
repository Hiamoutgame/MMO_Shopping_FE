import { useEffect, useState } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { chungSucApi } from '../../common/apis/chungSucApi';
import type { CampaignDto } from '../../common/models/chungSuc';
import type { ApiError } from '../../common/models/common';
import { APP_CONSTANTS } from '../../common/const/app';
import { formatDate } from '../../common/libs/formatter';
import { Button } from '../../components/Button/Button';
import { Chip } from '../../components/Chip/Chip';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { PageContainer } from '../../components/PageContainer/PageContainer';

function CampaignCard({ campaign }: { campaign: CampaignDto }) {
  const rewards = Object.entries(campaign.rewards ?? {});

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0C101CEE] p-5 shadow-[0_14px_28px_rgba(0,0,0,0.35)]">
      {campaign.imageUrl && (
        <img
          src={campaign.imageUrl}
          alt={campaign.name}
          className="h-40 w-full rounded-xl object-cover"
        />
      )}

      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-white">{campaign.name}</h2>
        {campaign.product && (
          <span className="text-xs text-[#566079]">Sản phẩm: {campaign.product.name}</span>
        )}
        {campaign.description && (
          <p className="text-sm leading-relaxed text-[#94A3B8]">{campaign.description}</p>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-[#566079]">Tối đa mỗi mã</dt>
          <dd className="font-semibold text-white">{campaign.targetQuantity} tài khoản</dd>
        </div>
        <div>
          <dt className="text-xs text-[#566079]">Kết thúc</dt>
          <dd className="font-semibold text-white">{formatDate(campaign.endTime)}</dd>
        </div>
      </dl>

      {rewards.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#07080D] p-3">
          <h3 className="font-mono text-[10px] font-extrabold uppercase tracking-[1.3px] text-[#566079]">
            Phần thưởng
          </h3>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-[#DCE4F8]">
            {rewards.map(([key, value]) => (
              <li key={key}>{String(value)}</li>
            ))}
          </ul>
        </div>
      )}

      <Link
        className="mt-auto"
        to={generatePath(APP_CONSTANTS.ROUTES.CHUNG_SUC_JOIN, { campaignId: campaign.id })}
      >
        <Button type="button" className="w-full">
          Gửi mã mời
        </Button>
      </Link>
    </article>
  );
}

export default function ChungSucCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    chungSucApi
      .activeCampaigns()
      .then((items) => {
        if (!cancelled) {
          setCampaigns(items);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError((err as ApiError).message || 'Không thể tải danh sách chiến dịch.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  return (
    <PageContainer className="flex flex-col gap-8 sm:gap-10">
      <header className="flex flex-col items-start gap-2">
        <Chip status="online">Tiếp sức</Chip>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-[38px]">Chung Sức</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#94A3B8]">
          Gửi mã mời của bạn, chọn số tài khoản hỗ trợ và để chúng tôi giúp bạn đủ lượt mời.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-[#94A3B8]">Đang tải chiến dịch...</p>
      ) : error ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#FF5C5C33] bg-[#0C101CEE] p-5">
          <p className="text-sm text-[#FF5C5C]">{error}</p>
          <Button type="button" variant="secondary" size="sm" onClick={retry}>
            Thử lại
          </Button>
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<span className="text-xl">◎</span>}
          title="Chưa có chiến dịch đang chạy"
          description="Các chiến dịch tiếp sức sẽ xuất hiện ở đây khi được mở."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
