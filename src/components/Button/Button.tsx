import React from 'react';
import { cn } from '../../common/libs/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none';
    
    const variantStyles = {
      primary: 'bg-gradient-to-r from-[#0EA5FF] to-[#7C3DFF] text-white hover:opacity-90 shadow-[0_8px_24px_rgba(78,100,255,0.4)]',
      secondary: 'bg-[#0C101CEE] border border-white/10 text-[#DCE4F8] hover:bg-white/5 hover:border-white/20',
      ghost: 'bg-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5',
    };

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 rounded-[10px]',
      md: 'text-[15px] px-5 py-2.5 rounded-[14px]',
      lg: 'text-base px-6 py-3.5 rounded-[16px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
