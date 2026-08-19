import React from 'react';
import { cn } from '../../common/libs/cn';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'online' | 'offline' | 'out_of_stock' | 'default';
  dot?: boolean;
}

export function Chip({ status = 'online', dot = true, className, children, ...props }: ChipProps) {
  const dotColor = {
    online: 'bg-[#35FFB1] shadow-[0_0_8px_#35FFB1]',
    offline: 'bg-[#6F7895]',
    out_of_stock: 'bg-[#FF5C5C] shadow-[0_0_8px_#FF5C5C]',
    default: 'bg-[#0EA5FF]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101521E6] border border-white/10 text-xs font-semibold font-mono tracking-wider uppercase text-[#DCE4F8]',
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-2 h-2 rounded-full', dotColor[status])} />}
      {children}
    </div>
  );
}
