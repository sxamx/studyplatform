import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { MathBlock as IMathBlock } from '../../../types';

interface MathBlockProps {
  block: IMathBlock;
}

export const MathBlock: React.FC<MathBlockProps> = ({ block }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(block.expression || '', {
        displayMode: !block.inline,
        throwOnError: false,
        strict: false,
        trust: false,
      });
    } catch (_err: any) {
      const safeText = (block.expression || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<span class="text-rose-500 font-mono">${safeText}</span>`;
    }
  }, [block.expression, block.inline]);

  return (
    <div className="my-5 space-y-2">
      {block.title && (
        <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white tracking-tight flex items-center gap-2">
          <span>🧮</span>
          <span>{block.title}</span>
        </h4>
      )}

      <div className="p-4 sm:p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2D2D2D] bg-gradient-to-r from-blue-50/20 to-purple-50/20 dark:from-[#151D2A]/40 dark:to-[#1C1628]/40 overflow-x-auto text-center shadow-sm">
        <div
          className="text-base sm:text-lg text-[#1A1A1A] dark:text-white inline-block max-w-full"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {block.explanation && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic text-center">
            {block.explanation}
          </p>
        )}
      </div>
    </div>
  );
};
