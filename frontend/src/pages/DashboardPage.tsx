import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCourseStore } from '../stores/courseStore';
import { useAuthStore } from '../stores/authStore';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Badge } from '../components/shared/Badge';
import { ProgressBar } from '../components/shared/ProgressBar';

export const DashboardPage: React.FC = () => {
  const { courses, fetchCourses, isLoading } = useCourseStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const totalCompletedLessons = courses.reduce((acc, c) => acc + c.completedLessons, 0);
  const totalLessons = courses.reduce((acc, c) => acc + c.totalLessons, 0);
  const overallPercentage = totalLessons > 0 ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0066CC] to-[#0052A3] dark:from-[#1A2E4C] dark:to-[#0F1E33] text-white p-8 sm:p-10 shadow-lg border border-[#0066CC]/20">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Aprende Programación Paso a Paso</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            ¡Hola, {user?.fullName || user?.email.split('@')[0] || 'Estudiante'}! 👋
          </h1>

          <p className="text-sm sm:text-base text-white/85 leading-relaxed">
            Bienvenido a tu plataforma interactiva de aprendizaje. Cada lección está estructurada con bloques dinámicos, código ejecutable y retos para afianzar tu conocimiento.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-xs">
              <Trophy className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {totalCompletedLessons} Lecciones Completadas
              </span>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      </div>

      {/* Stats Quick Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#0066CC]/10 dark:bg-[#4D94FF]/20 text-[#0066CC] dark:text-[#4D94FF]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#666666] dark:text-[#B0B0B0] font-medium">Cursos Disponibles</span>
            <p className="text-2xl font-black text-[#1A1A1A] dark:text-white">{courses.length}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#10A950]/10 dark:bg-[#2ECC71]/20 text-[#10A950] dark:text-[#2ECC71]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#666666] dark:text-[#B0B0B0] font-medium">Lecciones Totales</span>
            <p className="text-2xl font-black text-[#1A1A1A] dark:text-white">{totalLessons}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="w-full">
            <div className="flex justify-between items-center text-xs text-[#666666] dark:text-[#B0B0B0] font-medium">
              <span>Progreso Global</span>
              <span className="font-bold text-[#1A1A1A] dark:text-white">{overallPercentage}%</span>
            </div>
            <ProgressBar progress={overallPercentage} className="mt-2" />
          </div>
        </Card>
      </div>

      {/* Courses Catalog Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#1A1A1A] dark:text-white tracking-tight">
              Plan de Cursos
            </h2>
            <p className="text-xs text-[#666666] dark:text-[#B0B0B0]">
              Selecciona un curso para ver su temario e iniciar tus lecciones
            </p>
          </div>
        </div>

        {isLoading && courses.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="animate-pulse space-y-4 h-56">
                <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-1/3" />
                <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-3/4" />
                <div className="h-12 bg-gray-200 dark:bg-neutral-800 rounded" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isStarted = course.completedLessons > 0;
              const isCompleted = course.totalLessons > 0 && course.completedLessons === course.totalLessons;

              return (
                <Card
                  key={course.id}
                  hoverable
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="flex flex-col justify-between h-full group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={isCompleted ? 'success' : isStarted ? 'primary' : 'secondary'}>
                        {isCompleted ? 'Completado' : isStarted ? 'En Curso' : 'Sin Iniciar'}
                      </Badge>
                      <span className="text-xs font-semibold text-[#666666] dark:text-[#808080]">
                        {course.totalLessons} lecciones
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white group-hover:text-[#0066CC] dark:group-hover:text-[#4D94FF] transition-colors line-clamp-1">
                      {course.title}
                    </h3>

                    <p className="text-xs text-[#666666] dark:text-[#B0B0B0] line-clamp-3 leading-relaxed">
                      {course.description || 'Domina los conceptos fundamentales y pon a prueba tu conocimiento.'}
                    </p>
                  </div>

                  <div className="pt-6 space-y-4 border-t border-[#E0E0E0] dark:border-[#2D2D2D] mt-6">
                    <ProgressBar
                      progress={course.progressPercent}
                      label="Progreso"
                      showPercentage
                    />

                    <Button
                      variant={isStarted ? 'primary' : 'secondary'}
                      className="w-full"
                      rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    >
                      {isCompleted ? 'Repasar Curso' : isStarted ? 'Continuar Lección' : 'Empezar Curso'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
