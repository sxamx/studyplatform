import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, Check } from 'lucide-react';
import { QuestionChoiceBlock as IQuestionChoiceBlock } from '../../../types';
import { Button } from '../../shared/Button';

interface QuestionChoiceBlockProps {
  block: IQuestionChoiceBlock;
  savedAnswer?: string;
  onAnswerChange?: (selectedOptionId: string, isCorrect: boolean) => void;
}

export const QuestionChoiceBlock: React.FC<QuestionChoiceBlockProps> = ({
  block,
  savedAnswer,
  onAnswerChange,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(savedAnswer || null);
  const [submitted, setSubmitted] = useState<boolean>(Boolean(savedAnswer));

  const handleSelect = (id: string) => {
    if (submitted) return; // locked after check
    setSelectedId(id);
  };

  const handleCheck = () => {
    if (!selectedId) return;
    setSubmitted(true);
    const chosen = block.options.find((o) => o.id === selectedId);
    const isCorrect = Boolean(chosen?.isCorrect);
    if (onAnswerChange) {
      onAnswerChange(selectedId, isCorrect);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSelectedId(null);
  };

  const selectedOption = block.options.find((o) => o.id === selectedId);
  const isCorrect = selectedOption?.isCorrect ?? false;

  return (
    <div className="my-6 p-6 rounded-2xl border-2 border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A] shadow-sm transition-all">
      {/* Question Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="p-2 rounded-lg bg-[#0066CC]/10 dark:bg-[#4D94FF]/20 text-[#0066CC] dark:text-[#4D94FF] mt-0.5">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0066CC] dark:text-[#4D94FF]">
            Pregunta de Selección
          </span>
          <h4 className="text-lg font-bold text-[#1A1A1A] dark:text-white mt-0.5 leading-snug">
            {block.question}
          </h4>
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-3 mb-6">
        {block.options.map((option, idx) => {
          const isSelected = selectedId === option.id;
          let stateStyle = 'border-[#E0E0E0] dark:border-[#2D2D2D] hover:border-[#0066CC]/40 dark:hover:border-[#4D94FF]/40 bg-[#F5F5F5]/50 dark:bg-[#242424]/50';

          if (isSelected && !submitted) {
            stateStyle = 'border-[#0066CC] dark:border-[#4D94FF] bg-[#0066CC]/5 dark:bg-[#4D94FF]/10 ring-2 ring-[#0066CC]/20 dark:ring-[#4D94FF]/20';
          } else if (submitted) {
            if (option.isCorrect) {
              stateStyle = 'border-[#10A950] dark:border-[#2ECC71] bg-[#10A950]/10 dark:bg-[#2ECC71]/20 text-[#10A950] dark:text-[#2ECC71]';
            } else if (isSelected && !option.isCorrect) {
              stateStyle = 'border-[#DC3545] dark:border-[#FF6B6B] bg-[#DC3545]/10 dark:bg-[#FF6B6B]/20 text-[#DC3545] dark:text-[#FF6B6B]';
            } else {
              stateStyle = 'opacity-50 border-[#E0E0E0] dark:border-[#2D2D2D] bg-transparent';
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={submitted}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${stateStyle} disabled:cursor-default`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-center text-xs font-bold text-[#1A1A1A] dark:text-white shadow-xs">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm font-medium text-[#1A1A1A] dark:text-[#E0E0E0]">
                  {option.text}
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
            disabled={!selectedId}
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
              isCorrect
                ? 'bg-[#10A950]/10 border-[#10A950]/30 text-[#10A950] dark:text-[#2ECC71]'
                : 'bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545] dark:text-[#FF6B6B]'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-bold">
                {isCorrect ? '¡Excelente trabajo! Respuesta correcta.' : 'Incorrecto. Revisa la explicación a continuación.'}
              </p>
              {block.explanation && (
                <p className="text-xs mt-1.5 text-[#1A1A1A] dark:text-[#E0E0E0] leading-relaxed">
                  {block.explanation}
                </p>
              )}
            </div>
          </div>

          {!isCorrect && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Intentar de nuevo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
