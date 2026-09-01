import React, { useState } from 'react';
import { TabsBlock as ITabsBlock } from '../../../types';
import { MarkdownText } from './MarkdownText';
import { Copy, Check } from 'lucide-react';

interface TabsBlockProps {
  block: ITabsBlock;
}

export const TabsBlock: React.FC<TabsBlockProps> = ({ block }) => {
  const tabs = block.tabs || [];
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || '');
  const [copied, setCopied] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleCopy = () => {
    if (!activeTab) return;
    navigator.clipboard.writeText(activeTab.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (tabs.length === 0) return null;

  return (
    <div className="my-6 space-y-2">
      {block.title && (
        <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white tracking-tight flex items-center gap-2">
          <span>📑</span>
          <span>{block.title}</span>
        </h4>
      )}

      <div className="rounded-2xl border border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#121212] overflow-hidden shadow-sm">
        {/* Tab Headers */}
        <div className="flex items-center justify-between bg-gray-50 dark:bg-[#1A1A1A] border-b border-[#E0E0E0] dark:border-[#2D2D2D] px-2 pt-1.5 overflow-x-auto">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const isActive = (tab.id === activeTabId) || (!activeTabId && tab === tabs[0]);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white dark:bg-[#121212] text-[#0066CC] dark:text-[#4D94FF] border-t-2 border-t-[#0066CC] dark:border-t-[#4D94FF] shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab && (
            <button
              onClick={handleCopy}
              className="p-1.5 mb-1 text-gray-400 hover:text-[#0066CC] dark:hover:text-[#4D94FF] rounded-lg transition"
              title="Copiar contenido"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5">
          {activeTab && (
            activeTab.language ? (
              <pre className="p-4 rounded-xl bg-gray-950 text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto">
                <code>{activeTab.content}</code>
              </pre>
            ) : (
              <MarkdownText content={activeTab.content} />
            )
          )}
        </div>
      </div>
    </div>
  );
};
