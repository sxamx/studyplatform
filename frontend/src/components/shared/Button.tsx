import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-11 px-5 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#0066CC] hover:bg-[#0052A3] dark:bg-[#4D94FF] dark:hover:bg-[#66A3FF] text-white shadow-sm hover:shadow',
    secondary: 'bg-[#F5F5F5] hover:bg-[#ECECEC] dark:bg-[#1A1A1A] dark:hover:bg-[#242424] text-[#1A1A1A] dark:text-white border border-[#E0E0E0] dark:border-[#2D2D2D]',
    outline: 'border border-[#E0E0E0] dark:border-[#2D2D2D] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white',
    ghost: 'text-[#666666] hover:text-[#1A1A1A] dark:text-[#B0B0B0] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]',
    danger: 'bg-[#DC3545] hover:bg-[#C82333] text-white shadow-sm',
    success: 'bg-[#10A950] hover:bg-[#0E9445] dark:bg-[#2ECC71] dark:hover:bg-[#27AE60] text-white shadow-sm',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
