import React from 'react';
import { Block } from '../../types';
import { TextBlock } from './blocks/TextBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { QuestionChoiceBlock } from './blocks/QuestionChoiceBlock';
import { QuestionFreeBlock } from './blocks/QuestionFreeBlock';
import { QuizBlock } from './blocks/QuizBlock';
import { InfoBlock } from './blocks/InfoBlock';
import { DatabaseModelerBlock } from './blocks/DatabaseModelerBlock';

interface BlockRendererProps {
  block: Block;
  savedAnswer?: any;
  onAnswerChange?: (blockId: string, answer: any, isCorrect: boolean) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  savedAnswer,
  onAnswerChange,
}) => {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} />;
    case 'heading':
      return <HeadingBlock block={block} />;
    case 'code':
      return <CodeBlock block={block} />;
    case 'image':
      return <ImageBlock block={block} />;
    case 'video':
      return <VideoBlock block={block} />;
    case 'question_choice':
      return (
        <QuestionChoiceBlock
          block={block}
          savedAnswer={savedAnswer}
          onAnswerChange={(optId, isCorrect) => onAnswerChange?.(block.id, optId, isCorrect)}
        />
      );
    case 'question_free':
      return (
        <QuestionFreeBlock
          block={block}
          savedAnswer={savedAnswer}
          onAnswerChange={(ans, isCorrect) => onAnswerChange?.(block.id, ans, isCorrect)}
        />
      );
    case 'quiz':
      return (
        <QuizBlock
          block={block}
          onQuizComplete={(score, passed) => onAnswerChange?.(block.id, { score, passed }, passed)}
        />
      );
    case 'info':
      return <InfoBlock block={block} />;
    case 'database_modeler':
      return (
        <DatabaseModelerBlock
          block={block}
          savedAnswer={savedAnswer}
          onAnswerChange={(ans, isCorrect) => onAnswerChange?.(block.id, ans, isCorrect)}
        />
      );
    default:
      return (
        <div className="p-4 my-2 border border-red-300 rounded-lg text-xs text-red-500 font-mono">
          Tipo de bloque no soportado: {(block as any).type}
        </div>
      );
  }
};
