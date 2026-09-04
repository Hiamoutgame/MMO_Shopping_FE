import { NavLink } from 'react-router-dom';
import { cn } from '../common/libs/cn';
import { Button } from '../components/Button/Button';

const links = [
  { to: '/cashback', label: 'Lấy link', end: true },
  { to: '/cashback/wallet', label: 'Ví hoàn phí' },
  { to: '/cashback/orders', label: 'Đơn hàng' },
  { to: '/cashback/withdrawals', label: 'Rút tiền' },
  { to: '/cashback/referrals', label: 'Giới thiệu' },
];

export interface CashbackLayoutProps {
  children: React.ReactNode;
  providerEmail?: string | null;
  unlinking?: boolean;
  onUnlink: () => void;
}

export function CashbackLayout({ children, providerEmail, unlinking, onUnlink }: CashbackLayoutProps) {
  return (
    <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 rounded-2xl border border-white/10 bg-[#0B1020EE] p-3 shadow-[0_18px_38px_#00000055] lg:sticky lg:top-28 lg:w-60">
        <div className="border-b border-white/10 px-3 pb-3 pt-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#35FFB1]">Đã liên kết</span>
          <p className="mt-1 truncate text-sm font-semibold text-white">{providerEmail || 'Hoàn Phí 247'}</p>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto lg:flex-col" aria-label="Trung tâm hoàn phí">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => cn(
                'shrink-0 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                isActive ? 'bg-[#162033] text-white' : 'text-[#94A3B8] hover:bg-white/5 hover:text-white',
              )}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <Button variant="ghost" size="sm" className="mt-3 w-full text-[#8D94AA]" disabled={unlinking} onClick={onUnlink}>
          {unlinking ? 'Đang ngắt...' : 'Ngắt liên kết'}
        </Button>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
