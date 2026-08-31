import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = false,
  className,
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={twMerge('w-full space-y-1', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">
          {label && <span>{label}</span>}
          {showPercentage && <span>{clamped}%</span>}
        </div>
      )}
      <div className="w-full h-2.5 bg-[#ECECEC] dark:bg-[#242424] rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full transition-all duration-500 rounded-full',
            clamped === 100
              ? 'bg-[#10A950] dark:bg-[#2ECC71]'
              : 'bg-[#0066CC] dark:bg-[#4D94FF]'
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
