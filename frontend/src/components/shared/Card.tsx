import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hoverable = false, className, ...props }) => {
  return (
    <div
      className={twMerge(clsx(
        'bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl p-6 transition-all duration-150',
        'shadow-sm dark:shadow-none',
        hoverable && 'hover:border-[#0066CC]/50 dark:hover:border-[#4D94FF]/50 hover:shadow-md cursor-pointer',
        className
      ))}
      {...props}
    >
      {children}
    </div>
  );
};
