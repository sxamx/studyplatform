import React from 'react';
import { TextBlock as ITextBlock } from '../../../types';

interface TextBlockProps {
  block: ITextBlock;
}

export const TextBlock: React.FC<TextBlockProps> = ({ block }) => {
  // Render paragraphs with markdown-like bold/italic support
  const renderFormatted = (text: string) => {
    return text.split('\n\n').map((paragraph, idx) => (
      <p key={idx} className="text-base text-[#1A1A1A] dark:text-[#E0E0E0] leading-relaxed mb-4 last:mb-0">
        {paragraph}
      </p>
    ));
  };

  return <div className="my-3">{renderFormatted(block.content)}</div>;
};
