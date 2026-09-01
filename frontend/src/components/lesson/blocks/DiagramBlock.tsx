import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { DiagramBlock as IDiagramBlock } from '../../../types';
import { AlertCircle } from 'lucide-react';

interface DiagramBlockProps {
  block: IDiagramBlock;
}

export const DiagramBlock: React.FC<DiagramBlockProps> = ({ block }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      try {
        setError(null);
        const isDark = document.documentElement.classList.contains('dark');

        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'neutral',
          securityLevel: 'loose',
          fontFamily: 'inherit',
          fontSize: 13,
        });

        const uniqueId = `mermaid-${block.id}-${Math.random().toString(36).substring(2, 9)}`;
        const cleanSyntax = (block.syntax || '').trim();

        if (!cleanSyntax) {
          if (isMounted) setSvgHtml('');
          return;
        }

        const { svg } = await mermaid.render(uniqueId, cleanSyntax);
        if (isMounted) {
          setSvgHtml(svg);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Mermaid render error:', err);
          setError(err?.message || 'Error al compilar diagrama visual.');
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [block.syntax, block.id]);

  return (
    <div className="my-6 space-y-2">
      {block.title && (
        <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white tracking-tight flex items-center gap-2">
          <span>🧬</span>
          <span>{block.title}</span>
        </h4>
      )}

      <div className="p-4 sm:p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#121212] overflow-x-auto text-center flex flex-col items-center justify-center min-h-[140px] shadow-sm">
        {error ? (
          <div className="p-3 w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-left space-y-1.5 text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>Sintaxis de diagrama</span>
            </div>
            <pre className="p-2 bg-black/5 dark:bg-black/30 rounded font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
              {block.syntax}
            </pre>
          </div>
        ) : svgHtml ? (
          <div
            ref={containerRef}
            className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto transition-all"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        ) : (
          <div className="text-xs text-gray-400 animate-pulse">Generando diagrama visual...</div>
        )}

        {block.caption && (
          <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-3 italic block">
            {block.caption}
          </span>
        )}
      </div>
    </div>
  );
};
