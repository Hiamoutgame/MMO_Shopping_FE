import React from 'react';
import { cn } from '../../common/libs/cn';

export type StatusTone = 'green' | 'red' | 'amber' | 'blue' | 'gray' | 'violet';

const TONE: Record<StatusTone, { dot: string; text: string }> = {
  green: { dot: 'bg-[#35FFB1]', text: 'text-[#35FFB1]' },
  red: { dot: 'bg-[#FF5C5C]', text: 'text-[#FF5C5C]' },
  amber: { dot: 'bg-[#FACC15]', text: 'text-[#FACC15]' },
  blue: { dot: 'bg-[#0EA5FF]', text: 'text-[#0EA5FF]' },
  gray: { dot: 'bg-[#6F7895]', text: 'text-[#94A3B8]' },
  violet: { dot: 'bg-[#7C3DFF]', text: 'text-[#A78BFA]' },
};

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  label: string;
}

export function StatusBadge({ tone = 'gray', label, className, ...props }: StatusBadgeProps) {
  const colors = TONE[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#101521E6] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider',
        colors.text,
        className,
      )}
      {...props}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
      {label}
    </span>
  );
}
