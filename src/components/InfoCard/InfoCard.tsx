import React from 'react';
import { cn } from '../../common/libs/cn';

export interface InfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label?: string;
  title: string;
  desc?: string;
}

export function InfoCard({
  icon,
  label,
  title,
  desc,
  className,
  ...props
}: InfoCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-[18px] bg-[#0C101CEE] border border-white/10 shadow-[0_14px_28px_rgba(0,0,0,0.35)]',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="w-[46px] h-[46px] shrink-0 rounded-[12px] bg-gradient-to-r from-[#0EA5FF] to-[#7C3DFF] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(14,165,255,0.35)]">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {label && (
          <span className="font-mono text-[11px] font-extrabold tracking-wider uppercase text-[#2DD4BF]">
            {label}
          </span>
        )}
        <h4 className="text-[16px] font-bold text-[#F8FAFC]">{title}</h4>
        {desc && <p className="text-[13px] text-[#94A3B8] leading-snug mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}
