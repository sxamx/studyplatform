import React, { useState } from 'react';
import { HelpCircle, Lightbulb, Check, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import { QuestionFreeBlock as IQuestionFreeBlock } from '../../../types';
import { Button } from '../../shared/Button';

interface QuestionFreeBlockProps {
  block: IQuestionFreeBlock;
  savedAnswer?: string;
  onAnswerChange?: (answer: string, isCorrect: boolean) => void;
}

export const QuestionFreeBlock: React.FC<QuestionFreeBlockProps> = ({
  block,
  savedAnswer,
  onAnswerChange,
}) => {
  const [answer, setAnswer] = useState<string>(savedAnswer || '');
  const [submitted, setSubmitted] = useState<boolean>(Boolean(savedAnswer));
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  React.useEffect(() => {
    if (savedAnswer !== undefined) {
      setAnswer(savedAnswer || '');
      setSubmitted(Boolean(savedAnswer));
    }
  }, [savedAnswer]);

  const normalize = (str?: string) => (str || '').trim().toLowerCase().replace(/\s+/g, ' ');

  const hasExpected = Boolean(block.expectedAnswer?.trim());
  const isExactMatch = hasExpected ? normalize(answer) === normalize(block.expectedAnswer) : true;

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setSubmitted(true);
    if (onAnswerChange) {
      onAnswerChange(answer, isExactMatch);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setShowSolution(false);
    setAnswer('');
    onAnswerChange?.('', false);
  };

  return (
    <div className="my-6 p-6 rounded-2xl border-2 border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A] shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-[#0066CC]/10 dark:bg-[#4D94FF]/20 text-[#0066CC] dark:text-[#4D94FF] mt-0.5">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0066CC] dark:text-[#4D94FF]">
            Respuesta Libre / Código
          </span>
          <h4 className="text-lg font-bold text-[#1A1A1A] dark:text-white mt-0.5 leading-snug">
            {block.question}
          </h4>
        </div>
      </div>

      {/* Input Box */}
      <div className="mb-4">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitted}
          rows={3}
          maxLength={block.maxLength || 500}
          placeholder="Escribe tu respuesta o código aquí..."
          className={`w-full p-4 font-mono text-sm bg-[#F5F5F5] dark:bg-[#0F0F0F] text-[#1A1A1A] dark:text-white border-2 rounded-xl outline-none transition-all resize-y ${
            submitted
              ? isExactMatch
                ? 'border-[#10A950] dark:border-[#2ECC71]'
                : 'border-[#DC3545] dark:border-[#FF6B6B]'
              : 'border-[#E0E0E0] dark:border-[#2D2D2D] focus:border-[#0066CC] dark:focus:border-[#4D94FF]'
          } disabled:opacity-90`}
        />
        {block.maxLength && (
          <div className="flex justify-end text-[11px] text-[#999999] mt-1">
            {answer.length}/{block.maxLength} caracteres
          </div>
        )}
      </div>

      {/* Hint Accordion */}
      {block.hint && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{showHint ? 'Ocultar Pista' : '¿Necesitas una pista?'}</span>
            {showHint ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showHint && (
            <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
              💡 {block.hint}
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      {!submitted ? (
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!answer.trim()}
            rightIcon={<Check className="w-4 h-4" />}
          >
            Comprobar
          </Button>
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in">
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isExactMatch
                ? 'bg-[#10A950]/10 border-[#10A950]/30 text-[#10A950] dark:text-[#2ECC71]'
                : 'bg-[#FF9800]/10 border-[#FF9800]/30 text-[#FF9800] dark:text-[#FFB84D]'
            }`}
          >
            {isExactMatch ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="w-full">
              <p className="text-sm font-bold">
                {isExactMatch ? '¡Respuesta exacta!' : 'Respuesta enviada.'}
              </p>

              <div className="mt-3 pt-3 border-t border-current/20">
                <button
                  type="button"
                  onClick={() => setShowSolution(!showSolution)}
                  className="text-xs font-bold underline cursor-pointer"
                >
                  {showSolution ? 'Ocultar solución esperada' : 'Ver solución esperada'}
                </button>

                {showSolution && (
                  <div className="mt-2 p-3 rounded-lg bg-[#0F0F0F] text-[#E0E0E0] border border-[#2D2D2D] font-mono text-xs">
                    <code>{block.expectedAnswer}</code>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Intentar de nuevo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
