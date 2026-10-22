import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { chungSucApi } from '../../common/apis/chungSucApi';
import { useAuthStore } from '../../common/stores/useAuthStore';
import type {
  CampaignDto,
  MyRequestDto,
  ParticipantStatus,
  PriceCalculationDto,
} from '../../common/models/chungSuc';
import type { ApiError } from '../../common/models/common';
import { APP_CONSTANTS } from '../../common/const/app';
import { formatCurrency, formatDateTime } from '../../common/libs/formatter';
import { EVENT_VARIANT_LABELS, describeEventRules } from '../../common/libs/eventRules';
import { Button } from '../../components/Button/Button';
import { Chip } from '../../components/Chip/Chip';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { QuantitySelector } from '../../components/QuantitySelector/QuantitySelector';
import { SupportCodeInput } from '../../components/SupportCodeInput/SupportCodeInput';

const REQUEST_STATUS_LABELS: Record<ParticipantStatus, string> = {
  PENDING: 'Chờ xử lý',
  CHECKING: 'Đang kiểm tra mã',
  PROCESSING: 'Đang tiếp sức',
  SUCCESS: 'Hoàn tất',
  PARTIAL_SUCCESS: 'Hoàn tất một phần',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
};

export default function JoinChungSucPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const userId = useAuthStore((state) => state.user?.id);

  const [campaign, setCampaign] = useState<CampaignDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<PriceCalculationDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [requests, setRequests] = useState<MyRequestDto[]>([]);
  const [requestsKey, setRequestsKey] = useState(0);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;
    let cancelled = false;
    chungSucApi
      .campaign(campaignId)
      .then((item) => {
        if (!cancelled) setCampaign(item);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError((err as ApiError).message || 'Không thể tải thông tin chiến dịch.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  useEffect(() => {
    if (!campaignId) return;
    let cancelled = false;
    chungSucApi
      .myRequests()
      .then((items) => {
        if (!cancelled) setRequests(items.filter((item) => item.campaignId === campaignId));
      })
      .catch(() => {
        if (!cancelled) setRequests([]);
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId, requestsKey]);

  const productId = campaign?.productId;
  const seasonId = campaign?.seasonId ?? undefined;

  // Giá chỉ để tham khảo: gửi yêu cầu chưa tạo đơn và chưa trừ ví.
  useEffect(() => {
    if (!productId || !userId) return;
    let cancelled = false;
    chungSucApi
      .calculatePrice({ productId, accountId: userId, quantity, seasonId })
      .then((result) => {
        if (!cancelled) setPrice(result);
      })
      .catch(() => {
        if (!cancelled) setPrice(null);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, seasonId, userId, quantity]);

  if (loading) {
    return (
      <PageContainer>
        <p className="text-sm text-[#94A3B8]">Đang tải chiến dịch...</p>
      </PageContainer>
    );
  }

  if (!campaign) {
    return (
      <PageContainer className="flex flex-col items-start gap-4">
        <p className="text-sm text-[#FF5C5C]">{loadError || 'Không tìm thấy chiến dịch.'}</p>
        <Link to={APP_CONSTANTS.ROUTES.CHUNG_SUC}>
          <Button type="button" variant="secondary" size="sm">
            ← Về danh sách chiến dịch
          </Button>
        </Link>
      </PageContainer>
    );
  }

  const canJoin = campaign.status === 'ACTIVE';
  // Khách chỉ cần biết luật của mã mời, không cần luật của tài khoản hỗ trợ.
  const customerRules = describeEventRules(campaign).filter(
    (item) => item.label !== 'Mỗi tài khoản hỗ trợ giúp',
  );

  const handleCodeChange = (value: string) => {
    setInviteCode(value);
    setCodeError('');
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    const code = inviteCode.trim();
    if (!code) {
      setCodeError('Vui lòng nhập mã mời trước khi gửi.');
      return;
    }
    if (code.length > 100) {
      setCodeError('Mã mời tối đa 100 ký tự.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await chungSucApi.join(campaign.id, { inviteCode: code, quantity });
      setSubmitted(true);
      setInviteCode('');
      setQuantity(1);
      setRequestsKey((key) => key + 1);
    } catch (err) {
      setSubmitError((err as ApiError).message || 'Không thể gửi yêu cầu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (requestId: string) => {
    setCancellingId(requestId);
    setSubmitError(null);
    try {
      await chungSucApi.cancelRequest(requestId);
    } catch (err) {
      setSubmitError((err as ApiError).message || 'Không thể hủy yêu cầu.');
    } finally {
      setCancellingId(null);
      setRequestsKey((key) => key + 1);
    }
  };

  return (
    <PageContainer className="flex flex-col gap-8">
      <header className="flex flex-col items-start gap-2">
        <Chip status={canJoin ? 'online' : 'offline'}>{campaign.status}</Chip>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-[38px]">
          {campaign.name}
        </h1>
        {campaign.description && (
          <p className="max-w-2xl text-sm leading-relaxed text-[#94A3B8]">
            {campaign.description}
          </p>
        )}
        <dl className="mt-2 flex flex-wrap gap-2 text-xs">
          <div className="rounded-lg border border-white/10 bg-[#07080D] px-3 py-1.5">
            <dt className="inline text-[#566079]">Sự kiện: </dt>
            <dd className="inline text-[#DCE4F8]">{EVENT_VARIANT_LABELS[campaign.variant]}</dd>
          </div>
          {customerRules.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-white/10 bg-[#07080D] px-3 py-1.5"
            >
              <dt className="inline text-[#566079]">{item.label}: </dt>
              <dd className="inline text-[#DCE4F8]">{item.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0C101CEE] p-5 lg:col-span-7">
          <h2 className="font-mono text-xs uppercase tracking-wider text-[#566079]">
            Gửi mã mời
          </h2>

          {submitted && (
            <p className="rounded-xl border border-[#35FFB133] bg-[#07080D] p-3 text-sm text-[#35FFB1]">
              Đã nhận yêu cầu. Yêu cầu đang chờ xử lý và chưa trừ ví.
            </p>
          )}

          {canJoin ? (
            <>
              <SupportCodeInput value={inviteCode} error={codeError} onChange={handleCodeChange} />

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm text-[#DCE4F8]">Số tài khoản hỗ trợ</span>
                  <span className="text-xs text-[#566079]">
                    Tối đa {campaign.targetQuantity} tài khoản cho mỗi lần gửi
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-bold text-white">{quantity}</span>
                  <QuantitySelector
                    value={quantity}
                    max={campaign.targetQuantity}
                    onChange={setQuantity}
                  />
                </div>
              </div>

              {price && (
                <dl className="flex flex-col gap-2 border-t border-white/10 pt-4 text-sm">
                  <div className="flex justify-between text-[#94A3B8]">
                    <dt>Đơn giá mỗi tài khoản</dt>
                    <dd>{formatCurrency(price.finalPrice)}</dd>
                  </div>
                  <div className="flex justify-between font-semibold text-white">
                    <dt>Tối đa phải trả ({quantity} tài khoản)</dt>
                    <dd>{formatCurrency(Number(price.finalPrice) * quantity)}</dd>
                  </div>
                </dl>
              )}

              <p className="text-xs leading-relaxed text-[#566079]">
                Gửi yêu cầu chưa trừ ví. Ví chỉ bị trừ theo số tài khoản tiếp sức thành công.
              </p>

              {submitError && <p className="text-sm text-[#FF5C5C]">{submitError}</p>}

              <Button type="button" onClick={() => void handleSubmit()} disabled={submitting}>
                {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </Button>
            </>
          ) : (
            <p className="text-sm text-[#94A3B8]">Chiến dịch hiện không nhận yêu cầu.</p>
          )}

          <Link to={APP_CONSTANTS.ROUTES.CHUNG_SUC} className="self-start">
            <Button type="button" variant="ghost" size="sm">
              ← Về danh sách chiến dịch
            </Button>
          </Link>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0C101CEE] p-5 lg:col-span-5">
          <h2 className="font-mono text-xs uppercase tracking-wider text-[#566079]">
            Yêu cầu của tôi
          </h2>

          {requests.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">Bạn chưa gửi mã mời nào cho chiến dịch này.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-white/5">
              {requests.map((request) => (
                <li key={request.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate font-mono text-sm text-[#DCE4F8]">
                      {request.inviteCodeMasked}
                    </span>
                    <span className="text-xs text-[#566079]">
                      {request.quantity} tài khoản · {formatDateTime(request.joinedAt)}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-mono text-[11px] font-bold uppercase text-[#24D7FF]">
                      {REQUEST_STATUS_LABELS[request.status]}
                    </span>
                    {request.status === 'PENDING' && (
                      <button
                        type="button"
                        disabled={cancellingId === request.id}
                        onClick={() => void handleCancel(request.id)}
                        className="text-xs font-bold text-[#FF5C5C] hover:underline disabled:opacity-50"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
