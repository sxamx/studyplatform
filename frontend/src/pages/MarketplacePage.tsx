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
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Badge } from '../components/shared/Badge';

export const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<MarketplaceCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'paid'>('all');

  const loadMarketplace = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<{ courses: MarketplaceCourse[] }>('/marketplace/courses');
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Error fetching marketplace:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplace();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'free') return matchesSearch && c.price === 0;
    if (filterType === 'paid') return matchesSearch && c.price > 0;
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="p-8 sm:p-12 bg-gradient-to-br from-[#0066CC] to-[#004C99] dark:from-[#0B2545] dark:to-[#051329] rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-400/20">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Catálogo Oficial de Cursos
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Explora y Domina Nuevas Habilidades Técnicas
          </h1>
          <p className="text-sm text-blue-100/90 leading-relaxed">
            Cursos estructurados con lecciones interactivas, validaciones de código en tiempo real y certificación de progreso.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título o tema..."
            className="w-full h-11 pl-9 pr-4 bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
          />
        </div>

        <div className="flex items-center p-1 bg-gray-100 dark:bg-[#1F1F1F] rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterType === 'all'
                ? 'bg-white dark:bg-[#141414] text-[#0066CC] dark:text-[#4D94FF] shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('free')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterType === 'free'
                ? 'bg-white dark:bg-[#141414] text-[#0066CC] dark:text-[#4D94FF] shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Gratuitos
          </button>
          <button
            onClick={() => setFilterType('paid')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterType === 'paid'
                ? 'bg-white dark:bg-[#141414] text-[#0066CC] dark:text-[#4D94FF] shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Premium
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#0066CC] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-semibold">Cargando catálogo del marketplace...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden flex flex-col hover:border-[#0066CC] dark:hover:border-[#4D94FF] transition group cursor-pointer"
              onClick={() => navigate(`/marketplace/${course.id}`)}
            >
              {/* Thumbnail */}
              <div className="h-44 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-900 to-indigo-900 text-white font-bold text-lg">
                    {course.title.slice(0, 2)}
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant={course.price === 0 ? 'success' : 'primary'}>
                    {course.price === 0 ? 'GRATIS' : `$${course.price.toFixed(2)} ${course.currency}`}
                  </Badge>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <strong className="text-gray-700 dark:text-gray-200">{course.averageRating}</strong> ({course.purchaseCount} alumnos)
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {course.totalLessons} lecciones
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-[#1A1A1A] dark:text-white line-clamp-1 group-hover:text-[#0066CC] dark:group-hover:text-[#4D94FF] transition">
                    {course.title}
                  </h3>

                  <p className="text-xs text-[#666666] dark:text-[#B0B0B0] line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="w-3.5 h-3.5" />
                    <span>{course.creatorName}</span>
                  </div>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Ver Detalle
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
