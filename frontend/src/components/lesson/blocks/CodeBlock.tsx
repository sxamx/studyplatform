import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { CodeBlock as ICodeBlock } from '../../../types';

interface CodeBlockProps {
  block: ICodeBlock;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ block }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(block.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-xl border border-[#2D2D2D] bg-[#0F0F0F] overflow-hidden shadow-md">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1A1A1A] border-b border-[#2D2D2D]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#4D94FF]" />
          <span className="text-xs font-mono font-medium text-[#B0B0B0] uppercase tracking-wider">
            {block.language || 'code'}
          </span>
        </div>

        {block.copyable !== false && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-[#242424] hover:bg-[#2D2D2D] text-[#B0B0B0] hover:text-white transition-colors"
            title="Copiar código"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10A950]" />
                <span className="text-[#10A950]">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Code Area */}
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed text-[#E0E0E0]">
          <code>{block.code}</code>
        </pre>
      </div>
    </div>
  );
};
