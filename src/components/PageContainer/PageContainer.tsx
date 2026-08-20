import React from 'react';
import { cn } from '../../common/libs/cn';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        'relative w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-12 lg:py-12',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
