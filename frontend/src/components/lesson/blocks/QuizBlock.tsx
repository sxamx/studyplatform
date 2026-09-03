import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { QuizBlock as IQuizBlock } from '../../../types';
import { Button } from '../../shared/Button';

interface QuizBlockProps {
  block: IQuizBlock;
  savedAnswer?: any;
  onQuizComplete?: (score: number, passed: boolean) => void;
}

export const QuizBlock: React.FC<QuizBlockProps> = ({ block, savedAnswer, onQuizComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(Boolean(savedAnswer?.passed || (savedAnswer?.score !== undefined && savedAnswer?.score >= (block.passingScore || 70))));
  const [persistedScore, setPersistedScore] = useState<number | null>(savedAnswer?.score !== undefined ? Number(savedAnswer.score) : null);

  React.useEffect(() => {
    if (savedAnswer?.passed || savedAnswer?.score !== undefined) {
      setIsFinished(Boolean(savedAnswer?.passed || savedAnswer?.score >= (block.passingScore || 70)));
      setPersistedScore(Number(savedAnswer.score || 100));
    }
  }, [savedAnswer, block.passingScore]);

  if (!block.questions || block.questions.length === 0) {
    return (
      <div className="my-6 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 text-center text-sm text-gray-400">
        Este cuestionario no contiene preguntas configuradas aún.
      </div>
    );
  }

  const currentQ = block.questions[currentIdx] || block.questions[0];
  const totalQuestions = block.questions.length;
  const passingScore = block.passingScore || 70;

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNext = () => {
    if (!selectedOption) return;
    const newAnswers = { ...answers, [currentIdx]: selectedOption };
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentIdx + 1 < totalQuestions) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Calculate score
      let correctCount = 0;
      block.questions.forEach((q, idx) => {
        const userChoice = newAnswers[idx];
        const correctOpt = q.options.find((o) => o.isCorrect);
        if (correctOpt && correctOpt.id === userChoice) {
          correctCount++;
        }
      });

      const finalPercentage = Math.round((correctCount / totalQuestions) * 100);
      const passed = finalPercentage >= passingScore;
      setIsFinished(true);
      setPersistedScore(finalPercentage);
      if (onQuizComplete) {
        onQuizComplete(finalPercentage, passed);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setAnswers({});
    setSelectedOption(null);
    setIsFinished(false);
    setPersistedScore(null);
  };

  // Calculate final results if finished
  let correctCount = 0;
  if (isFinished) {
    block.questions.forEach((q, idx) => {
      const userChoice = answers[idx];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (correctOpt && correctOpt.id === userChoice) {
        correctCount++;
      }
    });
  }
  const scorePercent = persistedScore !== null ? persistedScore : (totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0);
  const passed = scorePercent >= passingScore;

  return (
    <div className="my-8 p-6 sm:p-8 rounded-2xl border-2 border-[#0066CC]/30 dark:border-[#4D94FF]/30 bg-white dark:bg-[#1A1A1A] shadow-md">
      {/* Quiz Title Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E0E0E0] dark:border-[#2D2D2D]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0066CC] dark:bg-[#4D94FF] text-white">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0066CC] dark:text-[#4D94FF]">
              Evaluación de Conocimiento
            </span>
            <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white leading-tight">
              {block.title}
            </h3>
          </div>
        </div>

        {!isFinished && (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#F5F5F5] dark:bg-[#242424] text-[#666666] dark:text-[#B0B0B0]">
            Pregunta {currentIdx + 1} de {totalQuestions}
          </span>
        )}
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Current Question */}
          <h4 className="text-base sm:text-lg font-semibold text-[#1A1A1A] dark:text-white leading-snug">
            {currentQ.question}
          </h4>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-[#0066CC] dark:border-[#4D94FF] bg-[#0066CC]/5 dark:bg-[#4D94FF]/10 ring-2 ring-[#0066CC]/20'
                      : 'border-[#E0E0E0] dark:border-[#2D2D2D] hover:border-[#0066CC]/40 dark:hover:border-[#4D94FF]/40 bg-[#F5F5F5]/40 dark:bg-[#242424]/40'
                  }`}
                >
                  <span className="w-7 h-7 rounded-lg bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-center text-xs font-bold text-[#1A1A1A] dark:text-white shrink-0 aspect-square">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm font-medium text-[#1A1A1A] dark:text-[#E0E0E0]">
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress Bar inside Quiz */}
          <div className="w-full h-1.5 bg-[#ECECEC] dark:bg-[#242424] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0066CC] dark:bg-[#4D94FF] transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!selectedOption}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              {currentIdx + 1 === totalQuestions ? 'Finalizar Quiz' : 'Siguiente'}
            </Button>
          </div>
        </div>
      ) : (
        /* Result Summary */
        <div className="py-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              passed
                ? 'bg-[#10A950]/20 text-[#10A950] dark:text-[#2ECC71]'
                : 'bg-[#DC3545]/20 text-[#DC3545] dark:text-[#FF6B6B]'
            }`}
          >
            {passed ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
          </div>

          <div className="space-y-2">
            <h4 className="text-2xl font-black text-[#1A1A1A] dark:text-white">
              {passed ? '¡Felicitaciones! Has aprobado el Quiz' : 'Sigue practicando'}
            </h4>
            <p className="text-sm text-[#666666] dark:text-[#B0B0B0]">
              Obtuviste <strong className="text-base text-[#1A1A1A] dark:text-white">{correctCount}</strong> de{' '}
              <strong>{totalQuestions}</strong> correctas ({scorePercent}%).
              El puntaje mínimo para aprobar es {passingScore}%.
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <Button variant="secondary" onClick={handleRestart} leftIcon={<RotateCcw className="w-4 h-4" />}>
              Reintentar Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
