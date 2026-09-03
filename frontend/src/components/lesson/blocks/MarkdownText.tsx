import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MarkdownTextProps {
  content: string;
  className?: string;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Formatter for inline text: math LaTeX ($x$, $$...$$), bold, italic, inline code, links, strikethrough
  const formatInline = (text: string): React.ReactNode[] => {
    const tokens: React.ReactNode[] = [];
    const regex = /(\$\$[^\$]+\$\$|\$[^\$]+\$|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|\[([^\]]+)\]\(([^)]+)\))/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(text.substring(lastIndex, match.index));
      }

      const matchStr = match[0];
      if (matchStr.startsWith('$$') && matchStr.endsWith('$$')) {
        const formula = matchStr.slice(2, -2).trim();
        try {
          const html = katex.renderToString(formula, { displayMode: true, throwOnError: false });
          tokens.push(
            <span
              key={match.index}
              className="inline-block my-1 text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          tokens.push(<code key={match.index}>{matchStr}</code>);
        }
      } else if (matchStr.startsWith('$') && matchStr.endsWith('$')) {
        const formula = matchStr.slice(1, -1).trim();
        try {
          const html = katex.renderToString(formula, { displayMode: false, throwOnError: false });
          tokens.push(
            <span
              key={match.index}
              className="inline-block mx-0.5 text-[#0066CC] dark:text-[#66B2FF] font-serif"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          tokens.push(<code key={match.index}>{matchStr}</code>);
        }
      } else if (matchStr.startsWith('`') && matchStr.endsWith('`')) {
        tokens.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[#0066CC] dark:text-[#4D94FF] font-mono text-xs font-semibold border border-blue-200/50 dark:border-blue-900/40"
          >
            {matchStr.slice(1, -1)}
          </code>
        );
      } else if (matchStr.startsWith('**') && matchStr.endsWith('**')) {
        tokens.push(
          <strong key={match.index} className="font-extrabold text-[#1A1A1A] dark:text-white">
            {matchStr.slice(2, -2)}
          </strong>
        );
      } else if (matchStr.startsWith('*') && matchStr.endsWith('*')) {
        tokens.push(
          <em key={match.index} className="italic text-[#333333] dark:text-[#D0D0D0]">
            {matchStr.slice(1, -1)}
          </em>
        );
      } else if (matchStr.startsWith('~~') && matchStr.endsWith('~~')) {
        tokens.push(
          <span key={match.index} className="line-through text-gray-400">
            {matchStr.slice(2, -2)}
          </span>
        );
      } else if (matchStr.startsWith('[')) {
        const linkMatch = matchStr.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          const rawHref = linkMatch[2].trim();
          const isSafeProtocol = /^(https?:\/\/|mailto:|\/|#)/i.test(rawHref);
          const safeHref = isSafeProtocol ? rawHref : '#';
          tokens.push(
            <a
              key={match.index}
              href={safeHref}
              target={safeHref.startsWith('http') ? '_blank' : undefined}
              rel={safeHref.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-[#0066CC] dark:text-[#4D94FF] underline font-semibold hover:opacity-80 transition-opacity"
            >
              {linkMatch[1]}
            </a>
          );
        }
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      tokens.push(text.substring(lastIndex));
    }

    return tokens;
  };

  // Normalize multiline block equations $$ ... $$ so they don't break across split('\n')
  const normalizedContent = content.replace(/\$\$([\s\S]+?)\$\$/g, (_m, formula) => {
    return `$$${formula.replace(/\n/g, ' ')}$$`;
  });

  const lines = normalizedContent.split('\n');
  const renderedBlocks: React.ReactNode[] = [];
  let currentListItems: string[] = [];
  let currentListType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (currentListItems.length > 0 && currentListType) {
      if (currentListType === 'ul') {
        renderedBlocks.push(
          <ul key={`list-${renderedBlocks.length}`} className="my-2.5 space-y-1.5 pl-5 list-disc text-sm text-[#1A1A1A] dark:text-[#E0E0E0]">
            {currentListItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {formatInline(item)}
              </li>
            ))}
          </ul>
        );
      } else {
        renderedBlocks.push(
          <ol key={`list-${renderedBlocks.length}`} className="my-2.5 space-y-1.5 pl-5 list-decimal text-sm text-[#1A1A1A] dark:text-[#E0E0E0]">
            {currentListItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {formatInline(item)}
              </li>
            ))}
          </ol>
        );
      }
      currentListItems = [];
      currentListType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Bullet List Item (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (currentListType && currentListType !== 'ul') flushList();
      currentListType = 'ul';
      currentListItems.push(trimmed.substring(2));
      continue;
    }

    // Numbered List Item (1. 2. etc)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      if (currentListType && currentListType !== 'ol') flushList();
      currentListType = 'ol';
      currentListItems.push(numMatch[2]);
      continue;
    }

    flushList();

    // Blockquote (> )
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s*/, '');
      renderedBlocks.push(
        <div
          key={`quote-${i}`}
          className="my-3 p-3.5 bg-blue-50/50 dark:bg-[#151D2A]/60 border-l-4 border-[#0066CC] dark:border-[#4D94FF] rounded-r-xl text-xs sm:text-sm text-[#2A2A2A] dark:text-[#C5C5C5] italic"
        >
          {formatInline(quoteText)}
        </div>
      );
      continue;
    }

    // Regular Paragraph
    renderedBlocks.push(
      <p key={`p-${i}`} className="my-2 text-sm sm:text-base text-[#1A1A1A] dark:text-[#E0E0E0] leading-relaxed">
        {formatInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 ${className}`}>{renderedBlocks}</div>;
};
