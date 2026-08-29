import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type FieldProps = {
  label: string;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

type SelectFieldProps = {
  label: string;
  options: Array<{ label: string; value: string }>;
  className?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

type TextAreaFieldProps = {
  label: string;
  className?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

const fieldClass =
  'mt-1 h-9 w-full rounded-[10px] border border-white/10 bg-[#07080D] px-3 text-[13px] text-[#F8FAFC] placeholder-[#566079] outline-none focus:border-[#0EA5FF]';

export function AdminField({ label, className, ...props }: FieldProps) {
  return (
    <label className={className}>
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[1.3px] text-[#566079]">
        {label}
      </span>
      <input className={fieldClass} {...props} />
    </label>
  );
}

export function AdminSelectField({ label, options, className, ...props }: SelectFieldProps) {
  return (
    <label className={className}>
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[1.3px] text-[#566079]">
        {label}
      </span>
      <select className={fieldClass} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminTextAreaField({ label, className, ...props }: TextAreaFieldProps) {
  return (
    <label className={className}>
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[1.3px] text-[#566079]">
        {label}
      </span>
      <textarea
        className="mt-1 min-h-24 w-full rounded-[10px] border border-white/10 bg-[#07080D] px-3 py-2 text-[13px] text-[#F8FAFC] placeholder-[#566079] outline-none focus:border-[#0EA5FF]"
        {...props}
      />
    </label>
  );
}

export function AdminDetailGrid({ items }: { items: Array<{ label: string; value: unknown }> }) {
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-white/10 bg-[#07080D] p-3">
          <dt className="font-mono text-[10px] font-extrabold uppercase tracking-[1.3px] text-[#566079]">
            {item.label}
          </dt>
          <dd className="mt-1 break-words text-[13px] text-[#DCE4F8]">
            {item.value === null || item.value === undefined || item.value === ''
              ? '-'
              : String(item.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
