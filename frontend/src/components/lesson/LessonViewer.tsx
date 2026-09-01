import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowLeft, ArrowRight, Award, Sparkles } from 'lucide-react';
import { LessonDetail } from '../../types';
import { BlockRenderer } from './BlockRenderer';
import { Button } from '../shared/Button';
import { useCourseStore } from '../../stores/courseStore';
import { Modal } from '../shared/Modal';

interface LessonViewerProps {
  lesson: LessonDetail;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({ lesson }) => {
  const navigate = useNavigate();
  const { submitProgress } = useCourseStore();
  const [answers, setAnswers] = useState<Record<string, any>>(lesson.progress?.answers || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const blocks = lesson.content?.lesson?.blocks || [];
  const interactiveBlocks = blocks.filter((b) =>
    ['question_choice', 'question_free', 'quiz'].includes(b.type)
  );

  const answeredCount = Object.keys(answers).length;
  const totalInteractive = interactiveBlocks.length;
  const progressPercent = totalInteractive > 0
    ? Math.round((answeredCount / totalInteractive) * 100)
    : 100;

  const handleAnswerChange = (blockId: string, value: any, _isCorrect: boolean) => {
    const updated = {
      ...answers,
      [blockId]: value,
    };
    setAnswers(updated);
    // Background auto-save so answers persist on reload (F5) or switching to phone
    submitProgress(lesson.id, updated, 100, false).catch(() => {});
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleCompleteLesson = async () => {
    setIsSubmitting(true);
    try {
      await submitProgress(lesson.id, answers, 100, true);
      triggerConfetti();
      setShowCelebration(true);
    } catch (err) {
      console.error('Error submitting progress:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Header & Sticky Progress */}
      <div className="sticky top-16 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 bg-white/95 dark:bg-[#0F0F0F]/95 backdrop-blur-md pb-4 pt-2 border-b border-[#E0E0E0] dark:border-[#2D2D2D] mb-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <button
            onClick={() => navigate(`/courses/${lesson.courseId}`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-[#1A1A1A] dark:text-[#B0B0B0] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al curso</span>
          </button>

          <div className="flex items-center gap-2">
            {lesson.progress?.completed && (
              <span className="flex items-center gap-1 text-xs font-bold text-[#10A950] dark:text-[#2ECC71]">
                <CheckCircle2 className="w-4 h-4" />
                Completada
              </span>
            )}
            <span className="text-xs font-medium text-[#666666] dark:text-[#808080]">
              {lesson.estimatedMinutes} min aprox.
            </span>
          </div>
        </div>

        {/* Lesson Progress Bar */}
        <div className="w-full h-2 bg-[#ECECEC] dark:bg-[#242424] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0066CC] dark:bg-[#4D94FF] transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Lesson Meta Header */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0066CC] dark:text-[#4D94FF]">
          {lesson.courseTitle} • Lección {lesson.order}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-white mt-1 mb-3 tracking-tight">
          {lesson.title}
        </h1>
        {lesson.description && (
          <p className="text-base text-[#666666] dark:text-[#B0B0B0] leading-relaxed">
            {lesson.description}
          </p>
        )}
      </div>

      {/* Blocks Sequence */}
      <div className="space-y-4">
        {blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            savedAnswer={answers[block.id]}
            onAnswerChange={handleAnswerChange}
          />
        ))}
      </div>

      {/* Bottom Action Controls */}
      <div className="mt-12 pt-6 border-t border-[#E0E0E0] dark:border-[#2D2D2D] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          {lesson.nav.prev ? (
            <Button
              variant="outline"
              size="md"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate(`/lessons/${lesson.nav.prev!.id}`)}
            >
              {lesson.nav.prev.title}
            </Button>
          ) : (
            <div />
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="success"
            size="lg"
            isLoading={isSubmitting}
            onClick={handleCompleteLesson}
            leftIcon={<Sparkles className="w-5 h-5" />}
          >
            {lesson.progress?.completed ? 'Guardar y Finalizar' : '¡Completar Lección!'}
          </Button>

          {lesson.nav.next && (
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate(`/lessons/${lesson.nav.next!.id}`)}
            >
              Siguiente Lección
            </Button>
          )}
        </div>
      </div>

      {/* Celebration Modal */}
      <Modal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        title="¡Lección Completada!"
        maxWidth="sm"
      >
        <div className="text-center py-4 space-y-5">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#10A950]/15 dark:bg-[#2ECC71]/20 text-[#10A950] dark:text-[#2ECC71] flex items-center justify-center animate-bounce">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h4 className="text-xl font-bold text-[#1A1A1A] dark:text-white">
              ¡Excelente progreso!
            </h4>
            <p className="text-sm text-[#666666] dark:text-[#B0B0B0] mt-1.5">
              Has completado <strong>{lesson.title}</strong> con éxito. Sigue con la siguiente para mantener tu racha de estudio.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            {lesson.nav.next ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setShowCelebration(false);
                  navigate(`/lessons/${lesson.nav.next!.id}`);
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continuar a la siguiente
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setShowCelebration(false);
                  navigate(`/courses/${lesson.courseId}`);
                }}
              >
                Volver al plan de estudios
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={() => setShowCelebration(false)}>
              Permanecer en esta lección
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
