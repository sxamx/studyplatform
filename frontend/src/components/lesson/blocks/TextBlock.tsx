import React from 'react';
import { TextBlock as ITextBlock } from '../../../types';
import { MarkdownText } from './MarkdownText';

interface TextBlockProps {
  block: ITextBlock;
}

export const TextBlock: React.FC<TextBlockProps> = ({ block }) => {
  return (
    <div className="my-3">
      <MarkdownText content={block.content} />
    </div>
  );
};
