import { Button } from '../Button/Button';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Xác nhận',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} aria-hidden="true" />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0C101CEE] p-6 shadow-[0_18px_38px_rgba(0,0,0,0.6)]">
        <h2 className="text-[16px] font-bold text-white">{title}</h2>
        <p className="mt-2 text-[13px] leading-6 text-[#94A3B8]">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant={danger ? 'primary' : 'secondary'}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className={danger ? 'from-[#FF5C5C] to-[#FF3B3B]' : undefined}
          >
            {loading ? 'Đang xử lý...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
