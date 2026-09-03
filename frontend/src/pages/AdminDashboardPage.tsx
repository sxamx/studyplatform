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
  Cpu,
} from 'lucide-react';
import { apiFetch } from '../api/client';
import { AdminStats, Course } from '../types';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Badge } from '../components/shared/Badge';
import { CourseModal } from '../components/admin/CourseModal';
import { AIPromptsModal } from '../components/admin/AIPromptsModal';
import { AdminLogsModal } from '../components/admin/AdminLogsModal';
import { CreatorApplicationsModal } from '../components/admin/CreatorApplicationsModal';
import { CourseReviewModal } from '../components/admin/CourseReviewModal';
import { AIConfigModal } from '../components/admin/AIConfigModal';
import { Diff } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState<number>(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isPromptsModalOpen, setIsPromptsModalOpen] = useState(false);
  const [isAIConfigOpen, setIsAIConfigOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Resilient data loading using Promise.allSettled
  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);

    const [statsResult, coursesResult, usersResult, appsResult, reviewsResult] = await Promise.allSettled([
      apiFetch<AdminStats>('/admin/stats'),
      apiFetch<{ courses: Course[] }>('/courses?all=true'),
      apiFetch<{ users: any[] }>('/admin/users'),
      apiFetch<{ applications: any[] }>('/admin/creator-applications'),
      apiFetch<{ reviews: any[] }>('/admin/course-reviews'),
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
    if (appsResult.status === 'fulfilled') {
      const pending = (appsResult.value.applications || []).filter((a: any) => a.status === 'pending').length;
      setPendingApplicationsCount(pending);
    }
    if (reviewsResult.status === 'fulfilled') {
      const pendingR = (reviewsResult.value.reviews || []).filter((r: any) => r.status === 'pending').length;
      setPendingReviewsCount(pendingR);
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

  const formatLastActive = (dateStr?: string) => {
    if (!dateStr || dateStr === '1970-01-01' || dateStr.startsWith('1970')) return 'Sin actividad';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Reciente';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);

    const timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (diffMin < 2) return '🟢 En línea ahora';
    if (diffMin < 60) return `Hace ${diffMin} min (${timeString})`;
    if (diffHours < 24 && d.getDate() === now.getDate()) return `Hoy a las ${timeString}`;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear()) {
      return `Ayer a las ${timeString}`;
    }

    return `${d.toLocaleDateString()} (${timeString})`;
  };

  const handleToggleSuspendUser = async (userId: string, isCurrentlySuspended: boolean) => {
    const action = isCurrentlySuspended ? 'reactivar' : 'suspender';
    if (!window.confirm(`¿Deseas ${action} el acceso a esta cuenta de usuario?`)) return;
    try {
      await apiFetch(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isSuspended: !isCurrentlySuspended }),
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar estado del usuario');
    }
  };

  const handleDeleteUser = async (userId: string, email: string, role?: string) => {
    let actionCourses = 'adopt';
    if (role === 'CREATOR') {
      const choice = window.prompt(
        `⚠️ El usuario (${email}) es un Creador.\n¿Qué deseas hacer con sus cursos creados?\n\n1 = Adoptar cursos (El Administrador asume la autoría y los cursos siguen activos)\n2 = Eliminar definitivamente sus cursos y contenido\n\nIngresa 1 o 2:`,
        '1'
      );
      if (choice === null) return;
      actionCourses = choice === '2' ? 'delete' : 'adopt';
    } else {
      if (!window.confirm(`⚠️ ACCIÓN CRÍTICA: ¿Estás seguro de eliminar permanentemente la cuenta (${email}) y todo su progreso?\n\nEsta acción no se puede deshacer.`)) return;
    }

    try {
      await apiFetch(`/admin/users/${userId}?actionCourses=${actionCourses}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar usuario');
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      await apiFetch(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar rol');
    }
  };

  const handleToggleAIAccess = async (userId: string, currentCanUseAi: boolean, currentLimit?: number) => {
    try {
      const newCanUse = !currentCanUseAi;
      let newLimit = currentLimit || 20;
      if (newCanUse && !currentCanUseAi) {
        const inputLimit = window.prompt('Límite diario de consultas de IA para este usuario:', String(newLimit));
        if (inputLimit !== null && !isNaN(Number(inputLimit))) {
          newLimit = Number(inputLimit);
        }
      }
      await apiFetch(`/admin/users/${userId}/ai-access`, {
        method: 'PATCH',
        body: JSON.stringify({ canUseAi: newCanUse, aiDailyLimit: newLimit }),
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar acceso a IA');
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      await apiFetch(`/courses/${course.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar visibilidad del curso');
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

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReviewsModalOpen(true)}
            className="relative"
            leftIcon={<Diff className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          >
            <span>Revisiones Whitelist</span>
            {pendingReviewsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-600 text-white animate-pulse">
                {pendingReviewsCount}
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsApplicationsModalOpen(true)}
            className="relative"
            leftIcon={<Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
          >
            <span>Solicitudes Creador</span>
            {pendingApplicationsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-purple-600 text-white animate-pulse">
                {pendingApplicationsCount}
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLogsModalOpen(true)}
            leftIcon={<FileText className="w-4 h-4 text-emerald-500" />}
          >
            Registro de Logs
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPromptsModalOpen(true)}
            leftIcon={<Sparkles className="w-4 h-4 text-purple-500" />}
          >
            Prompts de IA
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAIConfigOpen(true)}
            leftIcon={<Cpu className="w-4 h-4 text-purple-500" />}
          >
            Configurar IA (BYOK)
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
            Promedio de progreso real
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
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(course)}
                          className="inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition group"
                          title={course.isPublished ? 'Visible para estudiantes. Haz clic para ocultar.' : 'Oculto a estudiantes. Haz clic para publicar.'}
                        >
                          <Badge variant={course.isPublished ? 'success' : 'secondary'}>
                            {course.isPublished ? 'Publicado (Visible)' : 'Borrador (Oculto)'}
                          </Badge>
                        </button>
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white tracking-tight">
              Gestión de Usuarios y Cuentas ({users.length})
            </h2>
            <p className="text-xs text-gray-500">
              Control de acceso, prevención de multicuentas y seguimiento de actividad
            </p>
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F5F5] dark:bg-[#242424] border-b border-[#E0E0E0] dark:border-[#2D2D2D] text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#B0B0B0]">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Acceso IA</th>
                  <th className="px-6 py-4">Progreso</th>
                  <th className="px-6 py-4">Último Acceso</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0] dark:divide-[#2D2D2D]">
                {users.map((u) => {
                  const isSuspended = Boolean(u.isSuspended);
                  const isAdmin = u.role === 'ADMIN';
                  const aiDailyLimit = u.aiDailyLimit || 20;

                  return (
                    <tr key={u.id} className={`hover:bg-[#F5F5F5]/40 dark:hover:bg-[#242424]/40 transition-colors ${isSuspended ? 'opacity-60 bg-rose-50/20' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#1A1A1A] dark:text-white flex items-center gap-2">
                          <span>{u.fullName || 'Usuario'}</span>
                          {isAdmin && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              👑 Admin
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#666666] dark:text-[#808080] font-mono">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isAdmin ? (
                          <Badge variant="primary">ADMIN</Badge>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg border border-[#E0E0E0] dark:border-[#333] bg-white dark:bg-[#202020] text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC] cursor-pointer"
                          >
                            <option value="USER">Estudiante (USER)</option>
                            <option value="CREATOR">Creador (CREATOR)</option>
                            <option value="ADMIN">Administrador (ADMIN)</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={isSuspended ? 'error' : 'success'}>
                          {isSuspended ? '🔴 Suspendido' : '🟢 Activo'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {isAdmin ? (
                          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Ilimitado</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleAIAccess(u.id, Boolean(u.canUseAi), aiDailyLimit)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                              u.canUseAi
                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200'
                                : 'bg-gray-100 dark:bg-[#242424] text-gray-500 hover:bg-gray-200 dark:hover:bg-[#303030]'
                            }`}
                            title="Haz clic para activar/desactivar o ajustar límite de IA"
                          >
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            <span>{u.canUseAi ? `Activo (${aiDailyLimit}/día)` : 'Desactivado'}</span>
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {Number(u.enrolledCoursesCount || 0) === 0 ? (
                          <div className="text-xs text-gray-400 italic">
                            0 cursos inscritos
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-[#1A1A1A] dark:text-white text-xs">
                              <span className="text-[#0066CC] dark:text-[#4D94FF]">{u.completedLessons ?? 0}</span>
                              <span className="text-gray-400">de</span>
                              <span>{u.totalEnrolledLessons ?? 0} lecciones</span>
                              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                {Number(u.totalEnrolledLessons || 0) > 0 ? Math.round((Number(u.completedLessons || 0) / Number(u.totalEnrolledLessons)) * 100) : 0}%
                              </span>
                            </div>
                            <div className="text-[11px] text-[#666666] dark:text-[#808080] mt-0.5">
                              en {u.enrolledCoursesCount} {Number(u.enrolledCoursesCount) === 1 ? 'curso inscrito' : 'cursos inscritos'}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="font-medium text-[#1A1A1A] dark:text-white">
                          {formatLastActive(u.lastActiveAt || u.lastLoginAt || u.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isAdmin ? (
                          <span className="text-[11px] font-bold text-gray-400 italic">
                            Protegido
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant={isSuspended ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => handleToggleSuspendUser(u.id, isSuspended)}
                              className="text-xs"
                            >
                              {isSuspended ? 'Reactivar' : 'Suspender'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id, u.email, u.role)}
                              className="text-[#DC3545] hover:text-[#C82333]"
                              title="Eliminar Cuenta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

      {/* Universal BYOK AI Config Modal */}
      <AIConfigModal
        isOpen={isAIConfigOpen}
        onClose={() => setIsAIConfigOpen(false)}
      />

      {/* System Audit Logs Modal */}
      <AdminLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />

      {/* Creator Applications Review & Chat Modal */}
      <CreatorApplicationsModal
        isOpen={isApplicationsModalOpen}
        onClose={() => setIsApplicationsModalOpen(false)}
        onApplicationsChange={loadData}
      />

      {/* Course Whitelist & Diff Review Modal */}
      <CourseReviewModal
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        onReviewsChange={loadData}
      />
    </div>
  );
};
