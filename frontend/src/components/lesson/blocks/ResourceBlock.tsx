import React from 'react';
import { ResourceBlock as IResourceBlock } from '../../../types';
import { Download, FileText, ExternalLink, Archive, Code } from 'lucide-react';
import { Button } from '../../shared/Button';

interface ResourceBlockProps {
  block: IResourceBlock;
}

export const ResourceBlock: React.FC<ResourceBlockProps> = ({ block }) => {
  const fileType = (block.fileType || 'file').toLowerCase();

  const getIcon = () => {
    if (fileType.includes('pdf') || fileType.includes('doc')) return <FileText className="w-5 h-5 text-rose-500" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return <Archive className="w-5 h-5 text-amber-500" />;
    if (fileType.includes('py') || fileType.includes('java') || fileType.includes('js') || fileType.includes('sql')) return <Code className="w-5 h-5 text-blue-500" />;
    return <Download className="w-5 h-5 text-[#0066CC] dark:text-[#4D94FF]" />;
  };

  return (
    <div className="my-5 p-4 sm:p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#141414] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-[#0066CC] dark:hover:border-[#4D94FF] transition-all">
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-[#1E1E1E] flex items-center justify-center shrink-0">
          {getIcon()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white truncate">
              {block.title}
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-gray-100 dark:bg-[#202020] text-gray-600 dark:text-gray-300">
              {block.fileType || 'archivo'}
            </span>
          </div>
          {block.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {block.description}
            </p>
          )}
          {block.fileSize && (
            <span className="text-[10px] text-gray-400 block mt-0.5">
              Tamaño: {block.fileSize}
            </span>
          )}
        </div>
      </div>

      <a
        href={block.url}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="shrink-0 w-full sm:w-auto"
      >
        <Button
          variant="outline"
          size="sm"
          rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
          className="w-full sm:w-auto font-bold"
        >
          Descargar / Abrir
        </Button>
      </a>
    </div>
  );
};
