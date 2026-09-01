import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Layers,
  Sparkles,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { apiFetch } from '../api/client';
import { AdminStats, Course } from '../types';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Badge } from '../components/shared/Badge';
import { CourseModal } from '../components/admin/CourseModal';
import { AIPromptsModal } from '../components/admin/AIPromptsModal';
import { AdminLogsModal } from '../components/admin/AdminLogsModal';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isPromptsModalOpen, setIsPromptsModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Resilient data loading using Promise.allSettled
  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);

    const [statsResult, coursesResult, usersResult] = await Promise.allSettled([
      apiFetch<AdminStats>('/admin/stats'),
      apiFetch<{ courses: Course[] }>('/courses'),
      apiFetch<{ users: any[] }>('/admin/users'),
    ]);

    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value);
    }
    if (coursesResult.status === 'fulfilled') {
      setCourses(coursesResult.value.courses || []);
    }
    if (usersResult.status === 'fulfilled') {
      setUsers(usersResult.value.users || []);
    }

    if (
      statsResult.status === 'rejected' &&
      coursesResult.status === 'rejected' &&
      usersResult.status === 'rejected'
    ) {
      setLoadError('No se pudieron cargar los datos de administración. Verifica tu conexión o credenciales.');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este curso y todas sus lecciones?')) return;
    try {
      await apiFetch(`/courses/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 border-3 border-[#0066CC] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">
          Cargando panel de administración...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0066CC] dark:text-[#4D94FF]">
            Administración del Sistema
          </span>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] dark:text-white tracking-tight">
            Panel de Control
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsPromptsModalOpen(true)}
            leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
          >
            Prompts para IA
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsLogsModalOpen(true)}
            leftIcon={<FileText className="w-4 h-4 text-[#0066CC]" />}
          >
            Logs del Sistema
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/upload-json')}
            leftIcon={<Upload className="w-4 h-4" />}
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
            Nuevo Curso
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

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">Usuarios Totales</span>
            <div className="p-2 rounded-lg bg-[#0066CC]/10 text-[#0066CC] dark:text-[#4D94FF]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#1A1A1A] dark:text-white mt-2">
            {stats?.totalUsers ?? users.length}
          </p>
          <span className="text-[11px] text-[#666666] dark:text-[#808080] mt-1 block">
            {stats?.activeUsersThisWeek ?? 0} activos esta semana
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">Cursos Activos</span>
            <div className="p-2 rounded-lg bg-[#10A950]/10 text-[#10A950] dark:text-[#2ECC71]">
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
            <span className="text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">Lecciones Completadas</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#1A1A1A] dark:text-white mt-2">
            {stats?.completedLessonsTotal ?? 0}
          </p>
          <span className="text-[11px] text-[#666666] dark:text-[#808080] mt-1 block">
            En todas las cuentas
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">Tasa de Completitud</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#1A1A1A] dark:text-white mt-2">
            {stats?.averageCompletionRate ?? 0}%
          </p>
          <span className="text-[11px] text-[#666666] dark:text-[#808080] mt-1 block">
            Promedio de progreso
          </span>
        </Card>
      </div>

      {/* Courses Management Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white tracking-tight">
            Gestión de Cursos ({courses.length})
          </h2>
          <span className="text-xs text-gray-500">
            Haz clic en "Temario" para organizar módulos y lecciones
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
                        <Badge variant={course.isPublished ? 'success' : 'secondary'}>
                          {course.isPublished ? 'Publicado' : 'Borrador'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">
                        {course.totalLessons}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
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
                    <td colSpan={4} className="px-6 py-8 text-center text-xs text-gray-400">
                      No hay cursos registrados. Crea uno con el botón "Nuevo Curso".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white tracking-tight">
          Usuarios Registrados ({users.length})
        </h2>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F5F5] dark:bg-[#242424] border-b border-[#E0E0E0] dark:border-[#2D2D2D] text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#B0B0B0]">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Lecciones Completadas</th>
                  <th className="px-6 py-4">Último Acceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0] dark:divide-[#2D2D2D]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F5F5F5]/40 dark:hover:bg-[#242424]/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#1A1A1A] dark:text-white">{u.fullName || 'Usuario'}</div>
                      <div className="text-xs text-[#666666] dark:text-[#808080]">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.role === 'ADMIN' ? 'primary' : 'secondary'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">
                      <span className="font-bold text-[#1A1A1A] dark:text-white">
                        {u.completedLessons ?? 0}
                      </span>{' '}
                      {(u.completedLessons ?? 0) === 1 ? 'lección' : 'lecciones'}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#666666] dark:text-[#808080]">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Reciente'}
                    </td>
                  </tr>
                ))}
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

      {/* AI Prompts Center Modal */}
      <AIPromptsModal
        isOpen={isPromptsModalOpen}
        onClose={() => setIsPromptsModalOpen(false)}
      />

      {/* System Audit Logs Modal */}
      <AdminLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />
    </div>
  );
};
