import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-[#B0B0B0]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-[#999999] dark:text-[#808080] flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={twMerge(clsx(
            'w-full h-11 px-4 text-sm bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white',
            'border rounded-lg transition-all duration-150 outline-none',
            leftIcon ? 'pl-10' : 'pl-4',
            rightIcon ? 'pr-10' : 'pr-4',
            error
              ? 'border-[#DC3545] dark:border-[#FF6B6B] focus:ring-2 focus:ring-[#DC3545]/20'
              : 'border-[#E0E0E0] dark:border-[#2D2D2D] focus:border-[#0066CC] dark:focus:border-[#4D94FF] focus:ring-4 focus:ring-[#0066CC]/10 dark:focus:ring-[#4D94FF]/20',
            'disabled:bg-[#ECECEC] dark:disabled:bg-[#242424] disabled:cursor-not-allowed',
            className
          ))}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-[#999999] dark:text-[#808080] flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-[#DC3545] dark:text-[#FF6B6B] font-medium">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-[#666666] dark:text-[#808080]">{helperText}</p>
      )}
    </div>
  );
};
