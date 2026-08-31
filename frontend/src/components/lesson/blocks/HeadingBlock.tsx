import React from 'react';
import { HeadingBlock as IHeadingBlock } from '../../../types';

interface HeadingBlockProps {
  block: IHeadingBlock;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ block }) => {
  const { level, content } = block;

  const styles = {
    1: 'text-3xl font-extrabold text-[#1A1A1A] dark:text-white mt-8 mb-4 tracking-tight border-b border-[#E0E0E0] dark:border-[#2D2D2D] pb-3',
    2: 'text-2xl font-bold text-[#1A1A1A] dark:text-white mt-7 mb-3 tracking-tight',
    3: 'text-xl font-bold text-[#1A1A1A] dark:text-white mt-6 mb-2.5',
    4: 'text-lg font-semibold text-[#1A1A1A] dark:text-white mt-5 mb-2',
    5: 'text-base font-semibold text-[#1A1A1A] dark:text-white mt-4 mb-1.5',
    6: 'text-sm font-semibold text-[#666666] dark:text-[#B0B0B0] uppercase tracking-wider mt-4 mb-1',
  };

  const className = styles[level] || styles[2];

  switch (level) {
    case 1:
      return <h1 className={className}>{content}</h1>;
    case 2:
      return <h2 className={className}>{content}</h2>;
    case 3:
      return <h3 className={className}>{content}</h3>;
    case 4:
      return <h4 className={className}>{content}</h4>;
    case 5:
      return <h5 className={className}>{content}</h5>;
    case 6:
      return <h6 className={className}>{content}</h6>;
    default:
      return <h2 className={className}>{content}</h2>;
  }
};
