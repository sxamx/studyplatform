import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ArrowLeft, Play, Layers } from 'lucide-react';
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

  const hasModules = activeCourse.modules && activeCourse.modules.length > 0;

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
            {hasModules && (
              <Badge variant="secondary">
                <Layers className="w-3 h-3 mr-1 inline" /> {activeCourse.modules?.length} Módulos
              </Badge>
            )}
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white tracking-tight">
            Temario del Curso
          </h2>
          <span className="text-xs font-semibold text-[#666666] dark:text-[#808080]">
            {activeCourse.totalLessons} Lecciones en total
          </span>
        </div>

        {hasModules ? (
          <div className="space-y-6">
            {activeCourse.modules?.map((module, mIdx) => (
              <div key={module.id} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E0E0E0] dark:border-[#2D2D2D]">
                  <div>
                    <span className="text-xs font-bold text-[#0066CC] dark:text-[#4D94FF] uppercase tracking-wider">
                      Módulo {mIdx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">
                      {module.title}
                    </h3>
                    {module.description && (
                      <p className="text-xs text-[#666666] dark:text-[#B0B0B0] mt-0.5">{module.description}</p>
                    )}
                  </div>
                  {module.estimatedHours && (
                    <span className="text-xs font-semibold text-gray-400">~{module.estimatedHours} horas</span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {module.lessons?.map((lesson, lIdx) => {
                    const isCompleted = lesson.isCompleted;
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => navigate(`/lessons/${lesson.id}`)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isCompleted
                            ? 'bg-[#10A950]/5 dark:bg-[#2ECC71]/5 border-[#10A950]/30 hover:border-[#10A950]'
                            : 'bg-white dark:bg-[#1A1A1A] border-[#E0E0E0] dark:border-[#2D2D2D] hover:border-[#0066CC] dark:hover:border-[#4D94FF] shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              isCompleted
                                ? 'bg-[#10A950] text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : `${mIdx + 1}.${lIdx + 1}`}
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white">
                              {lesson.title}
                            </h4>
                            <p className="text-xs text-[#666666] dark:text-[#B0B0B0] mt-0.5">
                              {lesson.description || 'Lección interactiva estructurada'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {lesson.estimatedMinutes} min
                          </span>
                          <Button variant={isCompleted ? 'secondary' : 'primary'} size="sm">
                            {isCompleted ? 'Repasar' : 'Iniciar'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {activeCourse.lessons.map((lesson, idx) => {
              const isCompleted = lesson.isCompleted;
              return (
                <div
                  key={lesson.id}
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isCompleted
                      ? 'bg-[#10A950]/5 dark:bg-[#2ECC71]/5 border-[#10A950]/30 hover:border-[#10A950]'
                      : 'bg-white dark:bg-[#1A1A1A] border-[#E0E0E0] dark:border-[#2D2D2D] hover:border-[#0066CC] dark:hover:border-[#4D94FF] shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isCompleted
                          ? 'bg-[#10A950] text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-[#666666] dark:text-[#B0B0B0] mt-0.5">
                        {lesson.description || 'Lección interactiva estructurada'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {lesson.estimatedMinutes} min
                    </span>
                    <Button variant={isCompleted ? 'secondary' : 'primary'} size="sm">
                      {isCompleted ? 'Repasar' : 'Iniciar'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
