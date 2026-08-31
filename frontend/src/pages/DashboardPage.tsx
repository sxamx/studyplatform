import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Archive,
  RotateCcw,
  StickyNote,
  ShoppingBag,
  Layers,
} from 'lucide-react';
import { useCourseStore } from '../stores/courseStore';
import { useAuthStore } from '../stores/authStore';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Badge } from '../components/shared/Badge';
import { ProgressBar } from '../components/shared/ProgressBar';
import { Modal } from '../components/shared/Modal';
import { apiFetch } from '../api/client';
import { Course } from '../types';

export const DashboardPage: React.FC = () => {
  const { courses, fetchCourses, isLoading } = useCourseStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'in_progress' | 'completed' | 'archived'>('in_progress');
  const [editingNotesCourse, setEditingNotesCourse] = useState<Course | null>(null);
  const [courseNotes, setCourseNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const totalCompletedLessons = courses.reduce((acc, c) => acc + c.completedLessons, 0);
  const totalLessons = courses.reduce((acc, c) => acc + c.totalLessons, 0);
  const overallPercentage = totalLessons > 0 ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0;

  const handleUpdateStatus = async (courseId: string, status: 'in_progress' | 'completed' | 'archived') => {
    try {
      await apiFetch('/preferences/status', {
        method: 'POST',
        body: JSON.stringify({ courseId, status }),
      });
      fetchCourses();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el estado del curso');
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotesCourse) return;
    setIsSavingNotes(true);
    try {
      await apiFetch('/preferences/status', {
        method: 'POST',
        body: JSON.stringify({
          courseId: editingNotesCourse.id,
          status: editingNotesCourse.preferenceStatus || 'in_progress',
          notes: courseNotes,
        }),
      });
      setEditingNotesCourse(null);
      fetchCourses();
    } catch (err: any) {
      alert(err.message || 'Error al guardar notas');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const status = c.preferenceStatus || 'in_progress';
    if (activeTab === 'in_progress') return status === 'in_progress' || (c.progressPercent < 100 && status !== 'archived');
    if (activeTab === 'completed') return status === 'completed' || c.progressPercent === 100;
    if (activeTab === 'archived') return status === 'archived';
    return true;
  });

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
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/marketplace')}
              leftIcon={<ShoppingBag className="w-4 h-4 text-[#0066CC]" />}
            >
              Explorar Marketplace
            </Button>
          </div>
        </div>

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

      {/* Tabs for Course Status */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0E0E0] dark:border-[#2D2D2D] pb-4">
          <div>
            <h2 className="text-2xl font-black text-[#1A1A1A] dark:text-white tracking-tight">
              Mis Cursos
            </h2>
            <p className="text-xs text-[#666666] dark:text-[#B0B0B0]">
              Organiza tus estudios según tu progreso actual
            </p>
          </div>

          <div className="flex items-center p-1 bg-gray-100 dark:bg-[#1F1F1F] rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D]">
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'in_progress'
                  ? 'bg-white dark:bg-[#141414] text-[#0066CC] dark:text-[#4D94FF] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🚀 En Progreso ({courses.filter((c) => (c.preferenceStatus || 'in_progress') !== 'archived').length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'completed'
                  ? 'bg-white dark:bg-[#141414] text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              ✅ Completados ({courses.filter((c) => c.progressPercent === 100).length})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'archived'
                  ? 'bg-white dark:bg-[#141414] text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📦 Archivados ({courses.filter((c) => c.preferenceStatus === 'archived').length})
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-3 border-[#0066CC] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-400">Cargando cursos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden flex flex-col justify-between hover:border-[#0066CC] dark:hover:border-[#4D94FF] transition group"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0066CC] dark:text-[#4D94FF]">
                      <BookOpen className="w-5 h-5" />
                    </span>
                    <div className="flex items-center gap-1">
                      {course.totalModules && course.totalModules > 0 ? (
                        <Badge variant="primary" size="sm">
                          <Layers className="w-3 h-3 mr-1 inline" /> {course.totalModules} Módulos
                        </Badge>
                      ) : null}
                      <Badge variant={course.progressPercent === 100 ? 'success' : 'secondary'} size="sm">
                        {course.totalLessons} Lecciones
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white group-hover:text-[#0066CC] dark:group-hover:text-[#4D94FF] transition">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#666666] dark:text-[#B0B0B0] mt-1.5 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {course.preferenceNotes && (
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-1.5">
                      <StickyNote className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{course.preferenceNotes}</span>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">
                      <span>Progreso del Curso</span>
                      <span>{course.progressPercent}%</span>
                    </div>
                    <ProgressBar progress={course.progressPercent} />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-[#111111] border-t border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNotesCourse(course);
                        setCourseNotes(course.preferenceNotes || '');
                      }}
                      className="p-2 text-gray-500 hover:text-[#0066CC] rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                      title="Agregar o editar notas de estudio"
                    >
                      <StickyNote className="w-4 h-4" />
                    </button>

                    {course.preferenceStatus === 'archived' ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(course.id, 'in_progress')}
                        className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded transition"
                        title="Restaurar a cursos activos"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(course.id, 'archived')}
                        className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded transition"
                        title="Archivar curso"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/courses/${course.id}`)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    {course.progressPercent > 0 ? 'Continuar' : 'Empezar'}
                  </Button>
                </div>
              </Card>
            ))}

            {filteredCourses.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-[#E0E0E0] dark:border-[#2D2D2D] rounded-2xl">
                <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">
                  No hay cursos en esta sección
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  {activeTab === 'archived'
                    ? 'No has archivado ningún curso todavía.'
                    : 'Explora el catálogo o añade cursos a tu lista.'}
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate('/marketplace')}>
                  Ver Marketplace de Cursos
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Personal Notes Modal */}
      <Modal
        isOpen={Boolean(editingNotesCourse)}
        onClose={() => setEditingNotesCourse(null)}
        title={`Notas de Estudio: ${editingNotesCourse?.title}`}
      >
        <form onSubmit={handleSaveNotes} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
              Notas Personales y Recordatorios
            </label>
            <textarea
              value={courseNotes}
              onChange={(e) => setCourseNotes(e.target.value)}
              placeholder="Escribe tus metas, dudas o temas a repasar de este curso..."
              rows={5}
              className="w-full p-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E0E0] dark:border-[#2D2D2D]">
            <Button type="button" variant="ghost" onClick={() => setEditingNotesCourse(null)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSavingNotes}>
              Guardar Notas
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
