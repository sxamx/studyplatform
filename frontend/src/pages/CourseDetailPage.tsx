import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ArrowLeft, Play, Layers, Lock } from 'lucide-react';
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

  const lessons = Array.isArray(activeCourse.lessons) ? activeCourse.lessons : [];
  const hasModules = Array.isArray(activeCourse.modules) && activeCourse.modules.length > 0;

  const handleStartOrContinue = () => {
    const firstUncompleted = lessons.find((l) => !l.isCompleted && !l.isLocked);
    const target = firstUncompleted || lessons[0];
    if (target && !target.isLocked) {
      navigate(`/lessons/${target.id}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#B0B0B0] hover:text-[#0066CC] dark:hover:text-[#4D94FF] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Mis Cursos
      </button>

      {/* Hero Card */}
      <Card className="p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">
                {activeCourse.totalModules ? `${activeCourse.totalModules} Módulos` : 'Curso Interactivo'}
              </Badge>
              <Badge variant="secondary">
                {activeCourse.totalLessons} Lecciones
              </Badge>
              {activeCourse.sequentialUnlock && (
                <Badge variant="warning">
                  🔒 Progreso Secuencial
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] dark:text-white tracking-tight">
              {activeCourse.title}
            </h1>

            <p className="text-sm text-[#666666] dark:text-[#B0B0B0] leading-relaxed max-w-2xl">
              {activeCourse.description || 'Domina este curso con explicaciones claras, código en vivo y ejercicios de evaluación paso a paso.'}
            </p>

            {/* Progress Section */}
            <div className="pt-2 max-w-md space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#666666] dark:text-[#B0B0B0]">Progreso del Curso</span>
                <span className="text-[#0066CC] dark:text-[#4D94FF]">{activeCourse.progressPercent}% completado</span>
              </div>
              <ProgressBar progress={activeCourse.progressPercent} />
              <p className="text-[11px] text-gray-400">
                {activeCourse.completedLessons} de {activeCourse.totalLessons} lecciones completadas
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto flex flex-col items-center gap-3">
            <Button
              size="lg"
              variant="primary"
              onClick={handleStartOrContinue}
              leftIcon={<Play className="w-5 h-5 fill-current" />}
              className="w-full md:w-auto shadow-lg shadow-blue-500/20"
            >
              {activeCourse.progressPercent > 0 && activeCourse.progressPercent < 100
                ? 'Continuar Aprendiendo'
                : activeCourse.progressPercent === 100
                ? 'Repasar Curso Completo'
                : 'Empezar Curso'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Syllabus / Modules & Lessons */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0066CC] dark:text-[#4D94FF]" />
            Plan de Estudios y Temario
          </h2>
          <span className="text-xs text-[#666666] dark:text-[#B0B0B0] font-medium">
            Total {lessons.length} temas interactivos
          </span>
        </div>

        {/* Módulos agrupados (si existen) */}
        {hasModules ? (
          <div className="space-y-6">
            {activeCourse.modules?.map((module, mIdx) => (
              <div
                key={module.id}
                className="bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-[#E0E0E0] dark:border-[#2D2D2D] pb-3">
                  <div>
                    <span className="text-xs font-bold text-[#0066CC] dark:text-[#4D94FF] uppercase tracking-wider">
                      Módulo {mIdx + 1}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-white">
                      {module.title}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {module.lessons?.length || 0} lecciones
                  </span>
                </div>

                {module.description && (
                  <p className="text-xs text-[#666666] dark:text-[#B0B0B0]">
                    {module.description}
                  </p>
                )}

                <div className="space-y-2.5">
                  {module.lessons?.map((lesson, lIdx) => {
                    const isCompleted = lesson.isCompleted;
                    const isLocked = Boolean(lesson.isLocked);
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          if (!isLocked) navigate(`/lessons/${lesson.id}`);
                        }}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                          isLocked
                            ? 'bg-gray-100/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed'
                            : isCompleted
                            ? 'bg-[#10A950]/5 dark:bg-[#2ECC71]/5 border-[#10A950]/30 hover:border-[#10A950] cursor-pointer'
                            : 'bg-white dark:bg-[#1A1A1A] border-[#E0E0E0] dark:border-[#2D2D2D] hover:border-[#0066CC] dark:hover:border-[#4D94FF] shadow-sm cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              isLocked
                                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                                : isCompleted
                                ? 'bg-[#10A950] text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {isLocked ? <Lock className="w-4 h-4" /> : isCompleted ? <CheckCircle2 className="w-5 h-5" /> : `${mIdx + 1}.${lIdx + 1}`}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white">
                                {lesson.title}
                              </h4>
                              {isLocked && (
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
                                  Bloqueada
                                </span>
                              )}
                            </div>
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
                          <Button
                            variant={isLocked ? 'ghost' : isCompleted ? 'secondary' : 'primary'}
                            size="sm"
                            disabled={isLocked}
                          >
                            {isLocked ? 'Bloqueada' : isCompleted ? 'Repasar' : 'Iniciar'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Lecciones Sueltas / Generales */}
        {(() => {
          const unassigned = hasModules
            ? lessons.filter((l) => !l.moduleId || !activeCourse.modules?.some((m) => m.id === l.moduleId))
            : (!hasModules ? lessons : []);

          if (unassigned.length === 0) return null;

          return (
            <div className="space-y-3 pt-2">
              {hasModules && (
                <div className="pb-2 border-b border-[#E0E0E0] dark:border-[#2D2D2D]">
                  <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">
                    Temas Adicionales
                  </h3>
                </div>
              )}

              <div className="space-y-2.5">
                {unassigned.map((lesson, idx) => {
                  const isCompleted = lesson.isCompleted;
                  const isLocked = Boolean(lesson.isLocked);
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        if (!isLocked) navigate(`/lessons/${lesson.id}`);
                      }}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                        isLocked
                          ? 'bg-gray-100/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed'
                          : isCompleted
                          ? 'bg-[#10A950]/5 dark:bg-[#2ECC71]/5 border-[#10A950]/30 hover:border-[#10A950] cursor-pointer'
                          : 'bg-white dark:bg-[#1A1A1A] border-[#E0E0E0] dark:border-[#2D2D2D] hover:border-[#0066CC] dark:hover:border-[#4D94FF] shadow-sm cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isLocked
                              ? 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                              : isCompleted
                              ? 'bg-[#10A950] text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {isLocked ? <Lock className="w-4 h-4" /> : isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white">
                              {lesson.title}
                            </h4>
                            {isLocked && (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
                                Bloqueada
                              </span>
                            )}
                          </div>
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
                        <Button
                          variant={isLocked ? 'ghost' : isCompleted ? 'secondary' : 'primary'}
                          size="sm"
                          disabled={isLocked}
                        >
                          {isLocked ? 'Bloqueada' : isCompleted ? 'Repasar' : 'Iniciar'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
