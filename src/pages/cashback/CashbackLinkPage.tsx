import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { cashbackApi } from '../../common/apis/cashbackApi';
import { formatCurrency } from '../../common/libs/formatter';
import { cashbackLinkSchema } from '../../common/libs/validation';
import type { ApiError } from '../../common/models/common';
import type { CashbackLinkResult } from '../../common/models/cashback';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import type { CashbackOutletContext } from './CashbackCenterPage';

const steps = [
  ['01', 'Mua hàng qua link', 'Mở link vừa tạo và hoàn tất đơn hàng trên sàn.'],
  ['02', 'Ghi nhận & đối soát', 'Sàn ghi nhận giao dịch và kiểm tra điều kiện hoàn phí.'],
  ['03', 'Nhận hoàn phí', 'Khoản hoàn được duyệt sẽ xuất hiện trong ví và có thể rút.'],
];

export default function CashbackLinkPage() {
  const { config, requireReconnect } = useOutletContext<CashbackOutletContext>();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<CashbackLinkResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const platforms = [
    config?.cashback?.shopeeEnabled && { name: 'Shopee', rate: config.cashback.shopeeRate },
    config?.cashback?.tiktokEnabled && { name: 'TikTok Shop', rate: config.cashback.tiktokRate },
    config?.cashback?.lazadaEnabled && { name: 'Lazada', rate: config.cashback.lazadaRate },
  ].filter(Boolean) as Array<{ name: string; rate?: number }>;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = cashbackLinkSchema.safeParse({ url });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Link không hợp lệ.');
      return;
    }
    setLoading(true);
    setError('');
    setCopied(false);
    try {
      setResult(await cashbackApi.createLink(parsed.data.url));
    } catch (reason) {
      const apiError = reason as ApiError;
      if (apiError.errorCode === 'CASHBACK_REAUTH_REQUIRED') requireReconnect();
      setError(apiError.message || 'Không thể tạo link hoàn phí.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.affiliateUrl);
    setCopied(true);
  };

  return (
    <div className="flex flex-col gap-7">
      <section className="rounded-3xl border border-[#7887BE33] bg-[#0C101EEE] p-5 shadow-[0_22px_42px_#00000066] sm:p-7">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-bold uppercase text-[#566079]">Nền tảng hỗ trợ:</span>
          {platforms.length ? platforms.map((platform) => (
            <span key={platform.name} className="rounded-full border border-white/10 bg-[#101521] px-2.5 py-1 text-xs font-semibold text-[#DCE4F8]">
              {platform.name}{platform.rate != null ? ` · ${platform.rate}%` : ''}
            </span>
          )) : <span className="text-xs text-[#94A3B8]">Shopee · TikTok Shop</span>}
        </div>

        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit} noValidate>
          <label htmlFor="cashback-product-url" className="sr-only">Link sản phẩm</label>
          <Input
            id="cashback-product-url"
            type="url"
            placeholder="Dán link sản phẩm tại đây..."
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setResult(null);
              setError('');
              setCopied(false);
            }}
            aria-invalid={Boolean(error)}
            className="h-14"
          />
          <Button type="submit" size="lg" className="h-14 shrink-0 px-7" disabled={loading}>
            {loading ? 'Đang tạo link...' : 'Lấy link hoàn tiền'}
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-[#FF7B7B]" role="alert">{error}</p>}

        {result && (
          <div className="mt-5 rounded-2xl border border-[#35FFB1]/25 bg-[#071B1C] p-4 sm:p-5" role="status">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#35FFB1]">Link đã sẵn sàng</span>
                <p className="mt-1 truncate text-sm text-white">{result.affiliateUrl}</p>
                <p className="mt-2 text-sm text-[#94A3B8]">Hoàn phí tạm tính: <strong className="text-[#35FFB1]">{formatCurrency(result.cashbackAmount)}</strong></p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={() => void copyLink()}>{copied ? 'Đã sao chép' : 'Sao chép'}</Button>
                <a href={result.affiliateUrl} target="_blank" rel="noopener noreferrer"><Button type="button">Mua hàng qua link</Button></a>
              </div>
            </div>
          </div>
        )}

        {(config?.cashback?.shopeeNotice || config?.cashback?.tiktokNotice) && (
          <p className="mt-4 text-xs leading-relaxed text-[#8D94AA]">{config.cashback.shopeeNotice || config.cashback.tiktokNotice}</p>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0B1020BB] p-5 sm:p-8">
        <div className="text-center">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#9AA8FF]">Quy trình hoàn phí</span>
          <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">Ba bước rõ ràng, theo dõi dễ dàng</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map(([number, title, description]) => (
            <article key={number} className="rounded-2xl border border-white/10 bg-[#0C101E] p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#0EA5FF] to-[#7C3DFF] font-mono font-bold text-white">{number}</span>
              <h3 className="mt-4 font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
