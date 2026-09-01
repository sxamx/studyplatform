import React from 'react';
import { DividerBlock as IDividerBlock } from '../../../types';

interface DividerBlockProps {
  block: IDividerBlock;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({ block }) => {
  if (block.label) {
    return (
      <div className="relative my-8 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E0E0E0] dark:border-[#2D2D2D]" />
        </div>
        <div className="relative bg-white dark:bg-[#0F0F0F] px-4 text-xs font-bold uppercase tracking-wider text-gray-400">
          {block.label}
        </div>
      </div>
    );
  }

  return (
    <hr className="my-8 border-t border-[#E0E0E0] dark:border-[#2D2D2D]" />
  );
};
