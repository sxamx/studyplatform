import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Block } from '../../types';
import { TextBlock } from './blocks/TextBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { DocumentBlock } from './blocks/DocumentBlock';
import { QuestionChoiceBlock } from './blocks/QuestionChoiceBlock';
import { QuestionFreeBlock } from './blocks/QuestionFreeBlock';
import { QuizBlock } from './blocks/QuizBlock';
import { InfoBlock } from './blocks/InfoBlock';
import { DatabaseModelerBlock } from './blocks/DatabaseModelerBlock';
import { ErrorBoundary } from '../shared/ErrorBoundary';

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
  if (!block || !block.type) {
    return (
      <div className="p-3 my-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>Bloque vacío o con identificador no definido.</span>
      </div>
    );
  }

  const renderContent = () => {
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
      case 'document':
        return <DocumentBlock block={block} />;
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
          <div className="p-4 my-3 bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-600 dark:text-gray-400 font-mono flex items-center justify-between">
            <span>Tipo de bloque JSON: "{(block as any).type}"</span>
            <span className="text-[10px] uppercase font-bold text-gray-400">Personalizado</span>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary
      fallbackTitle={`Error al renderizar bloque (${block.type})`}
      fallbackMessage="Este bloque tiene una propiedad inesperada en su JSON. Puedes editarlo o continuar con el resto de la lección."
    >
      {renderContent()}
    </ErrorBoundary>
  );
};
