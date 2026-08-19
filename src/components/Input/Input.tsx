import React from 'react';
import { cn } from '../../common/libs/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-4 pointer-events-none text-[#94A3B8] flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-11 bg-[#0C101CEE] border border-white/10 rounded-[14px] px-4 text-sm text-[#F8FAFC] placeholder-[#566079] outline-none transition-all duration-200 focus:border-[#0EA5FF] focus:ring-1 focus:ring-[#0EA5FF]/30',
            icon && 'pl-11',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
