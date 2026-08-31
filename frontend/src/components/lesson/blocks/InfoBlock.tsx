import React from 'react';
import { Info, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { InfoBlock as IInfoBlock } from '../../../types';

interface InfoBlockProps {
  block: IInfoBlock;
}

export const InfoBlock: React.FC<InfoBlockProps> = ({ block }) => {
  const level = block.level || 'info';

  const config = {
    info: {
      border: 'border-[#2196F3]/30 dark:border-[#2196F3]/40',
      bg: 'bg-[#2196F3]/5 dark:bg-[#2196F3]/10',
      text: 'text-[#2196F3]',
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
  };

  const current = config[level] || config.info;
  const Icon = current.icon;

  return (
    <div className={`my-5 p-4 sm:p-5 rounded-xl border-l-4 ${current.border} ${current.bg} border-t border-r border-b`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${current.text}`} />
        <div className="space-y-1">
          <h5 className={`text-sm font-bold tracking-tight ${current.text}`}>
            {block.title || current.defaultTitle}
          </h5>
          <p className="text-sm text-[#1A1A1A] dark:text-[#E0E0E0] leading-relaxed">
            {block.message}
          </p>
        </div>
      </div>
    </div>
  );
};
