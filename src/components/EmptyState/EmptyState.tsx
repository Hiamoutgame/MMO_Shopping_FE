import React from 'react';
import { cn } from '../../common/libs/cn';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <section
      className={cn(
        'flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-[#0C101CEE] px-5 py-12 text-center shadow-[0_14px_28px_rgba(0,0,0,0.35)]',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-[#94A3B8]">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-white sm:text-2xl">{title}</h2>
      <p className="max-w-md text-sm leading-relaxed text-[#94A3B8]">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </section>
  );
}
