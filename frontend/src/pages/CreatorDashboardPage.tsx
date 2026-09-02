import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  CheckCircle2,
  TrendingUp,
  Plus,
  Layers,
  Upload,
  Sparkles,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { apiFetch } from '../api/client';
import { CreatorStats, Course } from '../types';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Badge } from '../components/shared/Badge';
import { CourseModal } from '../components/admin/CourseModal';
import { CourseAIChatDrawer } from '../components/creator/CourseAIChatDrawer';

export const CreatorDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [aiChatCourse, setAiChatCourse] = useState<Course | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);

    const [statsResult, coursesResult] = await Promise.allSettled([
      apiFetch<CreatorStats>('/creator/stats'),
      apiFetch<{ courses: Course[] }>('/creator/courses'),
    ]);

    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value);
    }
    if (coursesResult.status === 'fulfilled') {
      setCourses(coursesResult.value.courses || []);
    }

    if (statsResult.status === 'rejected' && coursesResult.status === 'rejected') {
      setLoadError('No se pudieron cargar los datos de tu panel de creador.');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestReview = async (courseId: string) => {
    try {
      await apiFetch(`/creator/courses/${courseId}/request-review`, { method: 'POST' });
      alert('¡Solicitud de revisión enviada al Administrador con éxito!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al solicitar revisión');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este curso y todas sus lecciones?')) return;
    try {
      await apiFetch(`/courses/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar curso');
    }
  };

  const getStatusBadge = (course: Course) => {
    switch (course.approvalStatus) {
      case 'pending_review':
        return <Badge variant="warning">⏳ En Revisión (Nuevo)</Badge>;
      case 'pending_update':
        return <Badge variant="warning">⏳ En Revisión (Actualización)</Badge>;
      case 'approved':
        return <Badge variant="success">🟢 Publicado en Marketplace</Badge>;
      case 'rejected':
        return <Badge variant="error">🔴 Rechazado con Observaciones</Badge>;
      case 'draft':
      default:
        return <Badge variant="secondary">📝 Borrador (Privado)</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 border-3 border-[#0066CC] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">
          Cargando panel de creador...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Panel del Instructor & Creador</span>
          </span>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] dark:text-white tracking-tight">
            Mis Cursos y Métricas
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Gestiona tus contenidos pedagógicos y supervisa el progreso de tus alumnos inscritos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/creator/guides')}
            leftIcon={<BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
          >
            Guías & Normas
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/upload')}
            leftIcon={<Upload className="w-4 h-4 text-[#0066CC]" />}
          >
            Subir JSON
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingCourse(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Crear Nuevo Curso
          </Button>
        </div>
      </div>

      {loadError && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{loadError}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Creator KPI Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">Mis Cursos Creados</span>
            <div className="p-2 rounded-lg bg-[#0066CC]/10 text-[#0066CC] dark:text-[#4D94FF]">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#1A1A1A] dark:text-white mt-2">
            {stats?.totalCourses ?? courses.length}
          </p>
          <span className="text-[11px] text-[#666666] dark:text-[#808080] mt-1 block">
            {stats?.totalLessons ?? 0} lecciones interactivas
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">Alumnos Inscritos</span>
            <div className="p-2 rounded-lg bg-[#10A950]/10 text-[#10A950] dark:text-[#2ECC71]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#1A1A1A] dark:text-white mt-2">
            {stats?.totalStudents ?? 0}
          </p>
          <span className="text-[11px] text-[#666666] dark:text-[#808080] mt-1 block">
            Estudiantes en tus cursos
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">Lecciones Completadas</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#1A1A1A] dark:text-white mt-2">
            {stats?.totalCompletions ?? 0}
          </p>
          <span className="text-[11px] text-[#666666] dark:text-[#808080] mt-1 block">
            Por tus estudiantes
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">Tasa de Avance</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#1A1A1A] dark:text-white mt-2">
            {stats?.averageCompletionRate ?? 0}%
          </p>
          <span className="text-[11px] text-[#666666] dark:text-[#808080] mt-1 block">
            Promedio de finalización
          </span>
        </Card>
      </div>

      {/* AI Copilot Highlight Banner */}
      <Card className="p-5 sm:p-6 bg-gradient-to-r from-purple-900/15 via-blue-900/10 to-transparent border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-[#0066CC] text-white flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-[#1A1A1A] dark:text-white">
                Copiloto de IA Pedagógico (Cloudflare Workers AI)
              </h3>
              <Badge variant="primary" className="bg-purple-600 text-white border-none text-[10px]">
                Llama 3.1 8B
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
              Diseña y genera lecciones interactivas, diagramas Mermaid, fórmulas LaTeX KaTeX y quizzes interactivos con asistencia experta en tiempo real.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/creator/guides')}
            className="flex-1 sm:flex-none text-xs"
          >
            Ver Normas & Prompts
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (courses.length > 0) {
                setAiChatCourse(courses[0]);
              } else {
                alert('Crea o sube primero un curso para iniciar el chat del Copiloto.');
              }
            }}
            className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Abrir Copiloto IA
          </Button>
        </div>
      </Card>

      {/* Creator Courses List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white tracking-tight">
            Mis Cursos ({courses.length})
          </h2>
          <span className="text-xs text-gray-500">
            Haz clic en "Temario" para agregar o editar módulos y lecciones
          </span>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F5F5] dark:bg-[#242424] border-b border-[#E0E0E0] dark:border-[#2D2D2D] text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#B0B0B0]">
                <tr>
                  <th className="px-6 py-4">Título del Curso</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Lecciones</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0] dark:divide-[#2D2D2D]">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <tr key={course.id} className="hover:bg-[#F5F5F5]/40 dark:hover:bg-[#242424]/40 transition-colors">
                      <td className="px-6 py-4">
                        <div
                          onClick={() => navigate(`/admin/courses/${course.id}/curriculum`)}
                          className="font-bold text-[#1A1A1A] dark:text-white hover:text-[#0066CC] dark:hover:text-[#4D94FF] cursor-pointer transition-colors"
                        >
                          {course.title}
                        </div>
                        <div className="text-xs text-[#666666] dark:text-[#808080] line-clamp-1">
                          {course.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(course)}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">
                        {course.totalLessons}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {/* Whitelist Request Button */}
                        {(!course.approvalStatus || course.approvalStatus === 'draft' || course.approvalStatus === 'rejected') && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleRequestReview(course.id)}
                            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <span className="hidden sm:inline">Solicitar Publicación</span>
                          </Button>
                        )}
                        {course.approvalStatus === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestReview(course.id)}
                            title="Enviar actualización del curso a revisión Whitelist"
                            leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-500" />}
                          >
                            <span className="hidden sm:inline">Publicar Actualización</span>
                          </Button>
                        )}

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setAiChatCourse(course)}
                          title="Abrir Copiloto de IA para este curso"
                          className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                          leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                        >
                          <span className="hidden sm:inline">Copiloto IA</span>
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/admin/courses/${course.id}/curriculum`)}
                          leftIcon={<Layers className="w-3.5 h-3.5 text-[#0066CC]" />}
                        >
                          <span className="hidden sm:inline">Temario</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCourse(course);
                            setIsModalOpen(true);
                          }}
                          title="Editar Ajustes del Curso"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#DC3545] hover:text-[#C82333]"
                          onClick={() => handleDeleteCourse(course.id)}
                          title="Eliminar Curso"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-xs text-gray-400">
                      Aún no has creado cursos. ¡Crea tu primer curso con el botón "Crear Nuevo Curso" o sube un archivo JSON!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Course Modal */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        course={editingCourse}
      />

      {/* AI Copilot Drawer */}
      {aiChatCourse && (
        <CourseAIChatDrawer
          isOpen={Boolean(aiChatCourse)}
          onClose={() => setAiChatCourse(null)}
          courseId={aiChatCourse.id}
          courseTitle={aiChatCourse.title}
        />
      )}
    </div>
  );
};
