import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className,
}) => {
  const variantStyles = {
    primary: 'bg-[#0066CC]/10 text-[#0066CC] dark:bg-[#4D94FF]/20 dark:text-[#4D94FF] border border-[#0066CC]/20',
    secondary: 'bg-[#F5F5F5] text-[#666666] dark:bg-[#242424] dark:text-[#B0B0B0] border border-[#E0E0E0] dark:border-[#2D2D2D]',
    success: 'bg-[#10A950]/10 text-[#10A950] dark:bg-[#2ECC71]/20 dark:text-[#2ECC71] border border-[#10A950]/20',
    warning: 'bg-[#FF9800]/10 text-[#FF9800] dark:bg-[#FFB84D]/20 dark:text-[#FFB84D] border border-[#FF9800]/20',
    error: 'bg-[#DC3545]/10 text-[#DC3545] dark:bg-[#FF6B6B]/20 dark:text-[#FF6B6B] border border-[#DC3545]/20',
    outline: 'bg-transparent text-[#666666] dark:text-[#B0B0B0] border border-[#E0E0E0] dark:border-[#2D2D2D]',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span className={twMerge(clsx('inline-flex items-center gap-1 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0', sizeStyles[size], variantStyles[variant], className))}>
      {children}
    </span>
  );
};
