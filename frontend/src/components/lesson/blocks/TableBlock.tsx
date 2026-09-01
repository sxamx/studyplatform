import React from 'react';
import { TableBlock as ITableBlock } from '../../../types';
import { MarkdownText } from './MarkdownText';

interface TableBlockProps {
  block: ITableBlock;
}

export const TableBlock: React.FC<TableBlockProps> = ({ block }) => {
  const headers = block.headers || [];
  const rows = block.rows || [];

  return (
    <div className="my-6 space-y-2">
      {block.title && (
        <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white tracking-tight flex items-center gap-2">
          <span>📊</span>
          <span>{block.title}</span>
        </h4>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#141414] shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          {headers.length > 0 && (
            <thead className="bg-gray-50 dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white font-bold border-b border-[#E0E0E0] dark:border-[#2D2D2D]">
              <tr>
                {headers.map((header, hIdx) => (
                  <th key={hIdx} className="p-3.5 sm:p-4 tracking-wide font-extrabold whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-[#E0E0E0] dark:divide-[#2D2D2D]">
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="hover:bg-gray-50/60 dark:hover:bg-[#1A1A1A]/60 transition-colors"
              >
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-3.5 sm:p-4 text-[#333333] dark:text-[#CCCCCC] leading-relaxed align-top">
                    <MarkdownText content={cell} className="text-xs" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
