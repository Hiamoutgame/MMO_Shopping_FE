import type { ReactNode } from 'react';
import { Button } from '../Button/Button';

export interface AdminModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

export function AdminModal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
}: AdminModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />
      <section className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0C101CEE] p-6 shadow-[0_18px_38px_rgba(0,0,0,0.6)]">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-extrabold text-white">{title}</h2>
            {description && (
              <p className="mt-1 text-[13px] leading-6 text-[#94A3B8]">{description}</p>
            )}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Dong
          </Button>
        </header>
        <div className="mt-5">{children}</div>
        {footer && <footer className="mt-6 flex flex-wrap justify-end gap-3">{footer}</footer>}
      </section>
    </div>
  );
}
