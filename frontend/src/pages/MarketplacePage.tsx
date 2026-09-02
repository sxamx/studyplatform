import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Star,
  BookOpen,
  User,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { MarketplaceCourse } from '../types';
import { apiFetch } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Badge } from '../components/shared/Badge';
import { ApplyCreatorModal } from '../components/creator/ApplyCreatorModal';

export const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<MarketplaceCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'paid'>('all');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const loadMarketplace = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<{ courses: MarketplaceCourse[] }>('/marketplace/courses');
      setCourses(Array.isArray(data?.courses) ? data.courses : []);
    } catch (err) {
      console.error('Error fetching marketplace:', err);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplace();
  }, []);

  const [showEnrolled, setShowEnrolled] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const handleQuickEnroll = async (e: React.MouseEvent, course: MarketplaceCourse) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    setEnrollingId(course.id);
    try {
      const res = await apiFetch<any>(`/marketplace/courses/${course.id}/buy`, {
        method: 'POST',
      });
      navigate(`/courses/${res.courseId || course.courseId}`);
    } catch (err: any) {
      alert(err.message || 'Error al inscribirse');
    } finally {
      setEnrollingId(null);
    }
  };

  const safeCourses = Array.isArray(courses) ? courses : [];

  // Filtramos según si el usuario desea ver los ya inscritos o solo cursos nuevos
  const displayedPool = safeCourses.filter((c) => (user && !showEnrolled ? !c.isEnrolled : true));

  const filteredCourses = displayedPool.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'free') return matchesSearch && c.price === 0;
    if (filterType === 'paid') return matchesSearch && c.price > 0;
    return matchesSearch;
  });

  const enrolledCount = safeCourses.filter((c) => c.isEnrolled).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="p-8 sm:p-12 bg-gradient-to-br from-[#0066CC] to-[#004C99] dark:from-[#0B2545] dark:to-[#051329] rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-400/20">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Catálogo Abierto de Cursos</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Marketplace de Cursos
          </h1>

          <p className="text-sm sm:text-base text-white/85 leading-relaxed">
            Descubre nuevos cursos creados por la comunidad, profundiza en temas avanzados y agrégalos a tu plan de estudio con un solo clic.
          </p>
        </div>

        {/* Creator CTA if student */}
        {user?.role === 'USER' && (
          <div className="p-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex flex-col items-center md:items-start gap-3 text-center md:text-left max-w-sm shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>¿Quieres ser Instructor?</span>
            </div>
            <p className="text-xs text-white/90">
              Crea y publica tus propios cursos modulares interactivos en el Marketplace.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsApplyModalOpen(true)}
              className="w-full bg-white text-[#0066CC] hover:bg-gray-100 font-bold border-none"
            >
              Postular como Creador
            </Button>
          </div>
        )}
      </div>

      {/* Auth Prompt if not logged in */}
      {!user && (
        <div className="p-6 bg-blue-50 dark:bg-blue-950/30 border border-[#0066CC]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-white">
              ¿Quieres acceder y guardar tus avances en estos cursos?
            </h3>
            <p className="text-xs text-gray-500">
              Regístrate gratis para desbloquear el contenido y registrar tus métricas de aprendizaje.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
              Crear Cuenta Gratis
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
              Iniciar Sesión
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#2D2D2D] shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título o tema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3">
          {user && enrolledCount > 0 && (
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer select-none bg-gray-50 dark:bg-[#141414] px-3 py-1.5 rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D]">
              <input
                type="checkbox"
                checked={showEnrolled}
                onChange={(e) => setShowEnrolled(e.target.checked)}
                className="w-3.5 h-3.5 text-[#0066CC] rounded"
              />
              <span>Mostrar ya inscritos ({enrolledCount})</span>
            </label>
          )}

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
                filterType === 'all'
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-400'
              }`}
            >
              Todos ({displayedPool.length})
            </button>
            <button
              onClick={() => setFilterType('free')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
                filterType === 'free'
                  ? 'bg-[#10A950] text-white'
                  : 'bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-400'
              }`}
            >
              Gratuitos ({displayedPool.filter((c) => c.price === 0).length})
            </button>
            <button
              onClick={() => setFilterType('paid')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
                filterType === 'paid'
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-400'
              }`}
            >
              Premium ({displayedPool.filter((c) => c.price > 0).length})
            </button>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-3 border-[#0066CC] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400">Cargando catálogo...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className={`overflow-hidden flex flex-col justify-between hover:border-[#0066CC] dark:hover:border-[#4D94FF] transition group ${
                course.isEnrolled ? 'border-emerald-500/30 bg-emerald-50/10' : ''
              }`}
            >
              <div className="space-y-4">
                {course.thumbnailUrl && (
                  <div className="relative h-44 -mx-6 -mt-6 overflow-hidden bg-gray-100 dark:bg-[#141414]">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {course.isEnrolled && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white shadow-md">
                          Inscrito
                        </span>
                      )}
                      <Badge variant={course.price === 0 ? 'success' : 'primary'}>
                        {course.price === 0 ? 'Gratis' : `$${course.price.toFixed(2)} ${course.currency}`}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {course.creatorName || 'Profesor'}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {course.averageRating.toFixed(1)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white group-hover:text-[#0066CC] dark:group-hover:text-[#4D94FF] transition">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#666666] dark:text-[#B0B0B0] mt-1.5 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> {course.totalLessons} lecciones
                </span>

                {course.isEnrolled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/courses/${course.courseId}`);
                    }}
                    className="border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-bold"
                  >
                    Ir al Curso
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    {course.price === 0 && (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={enrollingId === course.id}
                        onClick={(e) => handleQuickEnroll(e, course)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      >
                        Inscribirme Gratis
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/marketplace/${course.id}`)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Detalles
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {filteredCourses.length === 0 && safeCourses.length > 0 && !showEnrolled && (
            <div className="col-span-full py-12 px-6 text-center border-2 border-dashed border-[#10A950]/30 bg-[#10A950]/5 rounded-3xl space-y-4">
              <div className="w-14 h-14 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                🎉
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-[#1A1A1A] dark:text-white">
                  ¡Ya tienes todos los cursos disponibles en tu catálogo!
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Todos los cursos publicados ya están guardados en tu sección de "Mis Cursos". Puedes continuar estudiando o ver los cursos inscritos aquí.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="primary" size="sm" onClick={() => navigate('/')}>
                  Ir a Mis Cursos
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowEnrolled(true)}>
                  Ver Cursos Inscritos en Catálogo
                </Button>
              </div>
            </div>
          )}

          {filteredCourses.length === 0 && (safeCourses.length === 0 || showEnrolled) && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-[#E0E0E0] dark:border-[#2D2D2D] rounded-2xl">
              <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">
                No se encontraron cursos disponibles
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Prueba con otro término de búsqueda o regresa más tarde.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Apply Creator Modal */}
      <ApplyCreatorModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onStatusChange={loadMarketplace}
      />
    </div>
  );
};
