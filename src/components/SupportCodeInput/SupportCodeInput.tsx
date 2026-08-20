export interface SupportCodeInputProps {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export function SupportCodeInput({ value, error, onChange }: SupportCodeInputProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor="support-code" className="sr-only">Mã tiếp sức</label>
      <div className="flex min-h-[132px] w-full flex-col justify-between rounded-[18px] border border-[#26354C] bg-[#05070D] p-5 transition-colors focus-within:border-[#21D4FD] sm:p-6">
        <textarea
          id="support-code"
          rows={2}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="VD: TS8X 24GE MR2X QZ..."
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'support-code-error' : 'support-code-help'}
          className="w-full resize-none border-none bg-transparent font-mono text-base tracking-[1.1px] text-[#F2F4FF] outline-none placeholder:text-[#64748B]"
        />
        <span id="support-code-help" className="text-[13px] leading-[1.45] text-[#566079]">
          Dán mã vào đây. Hệ thống sẽ kiểm tra hiệu lực trước khi chuyển sang thanh toán.
        </span>
      </div>
      {error && <span id="support-code-error" className="text-xs text-[#FF5C5C]" role="alert">{error}</span>}
    </div>
  );
}
