import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, Check, RotateCcw } from 'lucide-react';
import { QuestionChoiceBlock as IQuestionChoiceBlock } from '../../../types';
import { Button } from '../../shared/Button';
import { MarkdownText } from './MarkdownText';

interface QuestionChoiceBlockProps {
  block: IQuestionChoiceBlock;
  savedAnswer?: string | string[];
  onAnswerChange?: (selectedOptionId: string | string[], isCorrect: boolean) => void;
}

export const QuestionChoiceBlock: React.FC<QuestionChoiceBlockProps> = ({
  block,
  savedAnswer,
  onAnswerChange,
}) => {
  const isMultiple = Boolean(block.multiple);

  const initialSelected = (): string[] => {
    if (Array.isArray(savedAnswer)) return savedAnswer;
    if (typeof savedAnswer === 'string' && savedAnswer) return [savedAnswer];
    return [];
  };

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected());
  const [submitted, setSubmitted] = useState<boolean>(initialSelected().length > 0);

  const handleToggle = (id: string) => {
    if (submitted) return; // locked after check

    if (isMultiple) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  };

  const handleCheck = () => {
    if (selectedIds.length === 0) return;
    setSubmitted(true);

    const correctIds = block.options.filter((o) => o.isCorrect).map((o) => o.id);
    const isCorrect =
      selectedIds.length === correctIds.length &&
      selectedIds.every((id) => correctIds.includes(id));

    if (onAnswerChange) {
      onAnswerChange(isMultiple ? selectedIds : selectedIds[0], isCorrect);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSelectedIds([]);
  };

  const correctIds = block.options.filter((o) => o.isCorrect).map((o) => o.id);
  const isAllCorrect =
    selectedIds.length === correctIds.length &&
    selectedIds.every((id) => correctIds.includes(id));

  return (
    <div className="my-6 p-5 sm:p-6 rounded-2xl border-2 border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A] shadow-sm transition-all">
      {/* Question Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="p-2 rounded-xl bg-[#0066CC]/10 dark:bg-[#4D94FF]/20 text-[#0066CC] dark:text-[#4D94FF] mt-0.5">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0066CC] dark:text-[#4D94FF]">
              {isMultiple ? 'Selección Múltiple (Varias respuestas)' : 'Pregunta de Selección Única'}
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-white mt-0.5 leading-snug">
            <MarkdownText content={block.question} />
          </div>
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-3 mb-6">
        {block.options.map((option, idx) => {
          const isSelected = selectedIds.includes(option.id);
          let stateStyle =
            'border-[#E0E0E0] dark:border-[#2D2D2D] hover:border-[#0066CC]/40 dark:hover:border-[#4D94FF]/40 bg-[#F5F5F5]/50 dark:bg-[#242424]/50';

          if (isSelected && !submitted) {
            stateStyle =
              'border-[#0066CC] dark:border-[#4D94FF] bg-[#0066CC]/5 dark:bg-[#4D94FF]/10 ring-2 ring-[#0066CC]/20 dark:ring-[#4D94FF]/20';
          } else if (submitted) {
            if (option.isCorrect) {
              stateStyle =
                'border-[#10A950] dark:border-[#2ECC71] bg-[#10A950]/10 dark:bg-[#2ECC71]/20 text-[#10A950] dark:text-[#2ECC71]';
            } else if (isSelected && !option.isCorrect) {
              stateStyle =
                'border-[#DC3545] dark:border-[#FF6B6B] bg-[#DC3545]/10 dark:bg-[#FF6B6B]/20 text-[#DC3545] dark:text-[#FF6B6B]';
            } else {
              stateStyle = 'opacity-50 border-[#E0E0E0] dark:border-[#2D2D2D] bg-transparent';
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleToggle(option.id)}
              disabled={submitted}
              className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${stateStyle} disabled:cursor-default`}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-xs shrink-0 aspect-square ${
                  isMultiple
                    ? isSelected ? 'bg-[#0066CC] text-white' : 'bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] text-[#1A1A1A] dark:text-white'
                    : 'bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] text-[#1A1A1A] dark:text-white'
                }`}>
                  {isMultiple ? (isSelected ? '✓' : String.fromCharCode(65 + idx)) : String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm font-medium text-[#1A1A1A] dark:text-[#E0E0E0] flex-1">
                  <MarkdownText content={option.text} />
                </span>
              </div>

              {submitted && option.isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-[#10A950] dark:text-[#2ECC71] flex-shrink-0" />
              )}
              {submitted && isSelected && !option.isCorrect && (
                <XCircle className="w-5 h-5 text-[#DC3545] dark:text-[#FF6B6B] flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Action Footer */}
      {!submitted ? (
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleCheck}
            disabled={selectedIds.length === 0}
            rightIcon={<Check className="w-4 h-4" />}
          >
            Comprobar Respuesta
          </Button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Feedback Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isAllCorrect
                ? 'bg-[#10A950]/10 border-[#10A950]/30 text-[#10A950] dark:text-[#2ECC71]'
                : 'bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545] dark:text-[#FF6B6B]'
            }`}
          >
            {isAllCorrect ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h5 className="text-sm font-bold">
                {isAllCorrect ? '¡Excelente! Respuesta Correcta' : 'Respuesta Incorrecta'}
              </h5>
              <div className="text-xs text-[#333333] dark:text-[#E0E0E0] leading-relaxed">
                <MarkdownText content={block.explanation} />
              </div>
            </div>
          </div>

          {!isAllCorrect && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Intentar de nuevo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
