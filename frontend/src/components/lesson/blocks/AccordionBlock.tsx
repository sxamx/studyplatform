import React, { useState } from 'react';
import { AccordionBlock as IAccordionBlock } from '../../../types';
import { ChevronDown, Sparkles } from 'lucide-react';
import { MarkdownText } from './MarkdownText';

interface AccordionBlockProps {
  block: IAccordionBlock;
}

export const AccordionBlock: React.FC<AccordionBlockProps> = ({ block }) => {
  const [isOpen, setIsOpen] = useState(Boolean(block.defaultOpen));

  return (
    <div className="my-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#141414] overflow-hidden shadow-sm transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-gray-50/80 dark:hover:bg-[#1A1A1A]/80 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#0066CC] dark:text-[#4D94FF] flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-[#1A1A1A] dark:text-white tracking-tight">
            {block.title}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0 ${
            isOpen ? 'rotate-180 text-[#0066CC] dark:text-[#4D94FF]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-[#E0E0E0] dark:border-[#2D2D2D] bg-gray-50/30 dark:bg-[#101010]/30 animate-in fade-in slide-in-from-top-1 duration-200">
          <MarkdownText content={block.content} className="text-xs sm:text-sm text-[#444444] dark:text-[#C5C5C5]" />
        </div>
      )}
    </div>
  );
};
