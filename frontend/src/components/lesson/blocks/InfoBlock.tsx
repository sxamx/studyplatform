import React from 'react';
import { Info, AlertTriangle, CheckCircle2, AlertCircle, Sparkles, Flame, Bookmark } from 'lucide-react';
import { InfoBlock as IInfoBlock } from '../../../types';
import { MarkdownText } from './MarkdownText';

interface InfoBlockProps {
  block: IInfoBlock;
}

export const InfoBlock: React.FC<InfoBlockProps> = ({ block }) => {
  const level = block.level || 'info';

  const config = {
    info: {
      border: 'border-[#0066CC]/30 dark:border-[#4D94FF]/40',
      bg: 'bg-[#0066CC]/5 dark:bg-[#4D94FF]/10',
      text: 'text-[#0066CC] dark:text-[#4D94FF]',
      icon: Info,
      defaultTitle: 'Información Importante',
    },
    warning: {
      border: 'border-[#FF9800]/30 dark:border-[#FF9800]/40',
      bg: 'bg-[#FF9800]/5 dark:bg-[#FF9800]/10',
      text: 'text-[#FF9800]',
      icon: AlertTriangle,
      defaultTitle: 'Advertencia',
    },
    success: {
      border: 'border-[#10A950]/30 dark:border-[#10A950]/40',
      bg: 'bg-[#10A950]/5 dark:bg-[#10A950]/10',
      text: 'text-[#10A950] dark:text-[#2ECC71]',
      icon: CheckCircle2,
      defaultTitle: 'Consejo / Buena Práctica',
    },
    error: {
      border: 'border-[#DC3545]/30 dark:border-[#DC3545]/40',
      bg: 'bg-[#DC3545]/5 dark:bg-[#DC3545]/10',
      text: 'text-[#DC3545] dark:text-[#FF6B6B]',
      icon: AlertCircle,
      defaultTitle: 'Error Común',
    },
    tip: {
      border: 'border-emerald-500/30 dark:border-emerald-400/40',
      bg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      icon: Sparkles,
      defaultTitle: 'Consejo Pro',
    },
    danger: {
      border: 'border-rose-600/30 dark:border-rose-500/40',
      bg: 'bg-rose-500/5 dark:bg-rose-500/10',
      text: 'text-rose-600 dark:text-rose-400',
      icon: Flame,
      defaultTitle: '¡Atención Crítica!',
    },
    note: {
      border: 'border-purple-500/30 dark:border-purple-400/40',
      bg: 'bg-purple-500/5 dark:bg-purple-500/10',
      text: 'text-purple-600 dark:text-purple-400',
      icon: Bookmark,
      defaultTitle: 'Nota del Profesor',
    },
  };

  const current = (config as any)[level] || config.info;
  const Icon = current.icon;

  return (
    <div className={`my-5 p-4 sm:p-5 rounded-2xl border-l-4 ${current.border} ${current.bg} border-t border-r border-b shadow-sm`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${current.text}`} />
        <div className="space-y-1.5 flex-1 min-w-0">
          <h5 className={`text-sm font-bold tracking-tight ${current.text}`}>
            {block.title || current.defaultTitle}
          </h5>
          <MarkdownText content={block.message} className="text-xs sm:text-sm text-[#1A1A1A] dark:text-[#E0E0E0] leading-relaxed" />
        </div>
      </div>
    </div>
  );
};
