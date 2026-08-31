import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ArrowLeft, Play } from 'lucide-react';
import { useCourseStore } from '../stores/courseStore';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { ProgressBar } from '../components/shared/ProgressBar';
import { Badge } from '../components/shared/Badge';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeCourse, fetchCourseById, isLoading } = useCourseStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchCourseById(id);
    }
  }, [id, fetchCourseById]);

  if (isLoading || !activeCourse) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="w-8 h-8 border-3 border-[#0066CC] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">Cargando plan de estudios...</p>
      </div>
    );
  }

  const totalMinutes = activeCourse.lessons.reduce((acc, l) => acc + (l.estimatedMinutes || 15), 0);
  const nextLesson = activeCourse.lessons.find((l) => !l.isCompleted) || activeCourse.lessons[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#666666] hover:text-[#1A1A1A] dark:text-[#B0B0B0] dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a todos los cursos</span>
      </button>

      {/* Course Hero Banner */}
      <Card className="p-8 sm:p-10 relative overflow-hidden bg-gradient-to-br from-white to-[#F5F5F5] dark:from-[#1A1A1A] dark:to-[#141414]">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="primary">Curso Interactivo</Badge>
            <span className="flex items-center gap-1 text-xs text-[#666666] dark:text-[#B0B0B0]">
              <Clock className="w-3.5 h-3.5" />
              {totalMinutes} min de contenido total
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-white tracking-tight">
            {activeCourse.title}
          </h1>

          <p className="text-sm sm:text-base text-[#666666] dark:text-[#B0B0B0] leading-relaxed">
            {activeCourse.description || 'Domina cada concepto a través de ejercicios prácticos, explicaciones claras y retos interactivos.'}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            {nextLesson && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/lessons/${nextLesson.id}`)}
                leftIcon={<Play className="w-5 h-5 fill-current" />}
              >
                {activeCourse.completedLessons > 0 ? 'Continuar Lección' : 'Comenzar Curso'}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E0E0E0] dark:border-[#2D2D2D]">
          <ProgressBar
            progress={activeCourse.progressPercent}
            label={`${activeCourse.completedLessons} de ${activeCourse.totalLessons} lecciones completadas`}
            showPercentage
          />
        </div>
      </Card>

      {/* Syllabus / Lessons List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white tracking-tight">
            Temario del Curso
          </h2>
          <span className="text-xs font-semibold text-[#666666] dark:text-[#808080]">
            {activeCourse.lessons.length} Módulos
          </span>
        </div>

        <div className="space-y-3">
          {activeCourse.lessons.map((lesson, idx) => {
            const isCompleted = lesson.isCompleted;

            return (
              <Card
                key={lesson.id}
                hoverable
                onClick={() => navigate(`/lessons/${lesson.id}`)}
                className={`p-5 flex items-center justify-between gap-4 transition-all group ${
                  isCompleted
                    ? 'border-[#10A950]/30 bg-[#10A950]/5 dark:bg-[#10A950]/10'
                    : 'hover:border-[#0066CC]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      isCompleted
                        ? 'bg-[#10A950] text-white'
                        : 'bg-[#F5F5F5] dark:bg-[#242424] text-[#666666] dark:text-[#B0B0B0] group-hover:bg-[#0066CC] group-hover:text-white transition-colors'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-[#1A1A1A] dark:text-white group-hover:text-[#0066CC] dark:group-hover:text-[#4D94FF] transition-colors">
                      {lesson.title}
                    </h4>
                    {lesson.description && (
                      <p className="text-xs text-[#666666] dark:text-[#B0B0B0] line-clamp-1 mt-0.5">
                        {lesson.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="hidden sm:flex items-center gap-1 text-xs text-[#666666] dark:text-[#808080]">
                    <Clock className="w-3.5 h-3.5" />
                    {lesson.estimatedMinutes || 15} min
                  </span>

                  <Button
                    variant={isCompleted ? 'outline' : 'primary'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/lessons/${lesson.id}`);
                    }}
                  >
                    {isCompleted ? 'Repasar' : 'Iniciar'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
