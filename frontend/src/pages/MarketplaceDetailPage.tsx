import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  BookOpen,
  CheckCircle2,
  ArrowLeft,
  Award,
  Play,
  MessageSquarePlus,
} from 'lucide-react';
import { MarketplaceCourse } from '../types';
import { apiFetch } from '../api/client';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Badge } from '../components/shared/Badge';
import { Modal } from '../components/shared/Modal';

export const MarketplaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<MarketplaceCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadCourse = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<MarketplaceCourse>(`/marketplace/courses/${id}`);
      setCourse(data);
    } catch (err) {
      console.error('Error fetching course detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

  const handleEnrollOrBuy = async () => {
    if (!course) return;
    setIsBuying(true);
    try {
      const res = await apiFetch<any>(`/marketplace/courses/${id}/buy`, {
        method: 'POST',
      });
      alert('¡Inscripción exitosa! El curso se ha agregado a tu catálogo de estudio.');
      navigate(`/courses/${res.courseId || course.courseId}`);
    } catch (err: any) {
      alert(err.message || 'Error al procesar la inscripción');
    } finally {
      setIsBuying(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      await apiFetch(`/marketplace/courses/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating: reviewRating, reviewText }),
      });
      setIsReviewModalOpen(false);
      setReviewText('');
      loadCourse();
    } catch (err: any) {
      alert(err.message || 'Error al publicar reseña');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#0066CC] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-500 font-semibold">Cargando detalles del curso...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white">Curso no encontrado</h2>
        <p className="text-xs text-gray-500">
          No pudimos localizar este curso en el Marketplace o ha sido retirado.
        </p>
        <Button variant="primary" size="sm" onClick={() => navigate('/marketplace')}>
          Volver al Catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/marketplace')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#0066CC] transition"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al Catálogo
      </button>

      {/* Main Course Header Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={course.price === 0 ? 'success' : 'primary'}>
                {course.price === 0 ? 'CURSO GRATUITO' : `$${course.price.toFixed(2)} ${course.currency}`}
              </Badge>
              <span className="text-xs text-gray-400">Por {course.creatorName}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-white tracking-tight">
              {course.title}
            </h1>

            <p className="text-sm text-[#666666] dark:text-[#B0B0B0] leading-relaxed">
              {course.description}
            </p>

            <div className="flex items-center gap-6 pt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {course.averageRating} ({course.reviews?.length || 0} reseñas)
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {course.totalLessons} lecciones interactivas
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-500" />
                Certificado Incluido
              </span>
            </div>
          </div>

          {/* What's included */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-base text-[#1A1A1A] dark:text-white">Lo que incluye este curso</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#666666] dark:text-[#B0B0B0]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Acceso ilimitado y permanente</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Ejercicios de código interactivo con validación</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Evaluaciones y quizzes con retroalimentación</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Seguimiento de progreso y estadísticas en tiempo real</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Purchase Card */}
        <div className="space-y-6">
          <Card className="p-6 space-y-5 border-2 border-[#0066CC]/20 shadow-lg">
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden relative">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-900 to-indigo-900 text-white font-bold text-lg">
                  {course.title.slice(0, 2)}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-[#1A1A1A] dark:text-white">
                {course.price === 0 ? 'Gratis' : `$${course.price.toFixed(2)} ${course.currency}`}
              </div>
              <p className="text-[11px] text-gray-400">Garantía de satisfacción y soporte de aprendizaje</p>
            </div>

            {course.isPurchased ? (
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate(`/courses/${course.courseId}`)}
                leftIcon={<Play className="w-4 h-4" />}
              >
                Continuar Aprendiendo
              </Button>
            ) : (
              <Button
                variant="primary"
                fullWidth
                isLoading={isBuying}
                onClick={handleEnrollOrBuy}
              >
                {course.price === 0 ? 'Inscribirse Gratis' : 'Comprar Curso Ahora'}
              </Button>
            )}
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-6 pt-6 border-t border-[#E0E0E0] dark:border-[#2D2D2D]">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">
            Reseñas y Valoraciones ({course.reviews?.length || 0})
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReviewModalOpen(true)}
            leftIcon={<MessageSquarePlus className="w-4 h-4" />}
          >
            Dejar Reseña
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {course.reviews?.map((rev) => (
            <Card key={rev.id} className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#1A1A1A] dark:text-white">{rev.userName}</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#666666] dark:text-[#B0B0B0] leading-relaxed">
                {rev.reviewText || 'Excelente curso, muy bien explicado y práctico.'}
              </p>
            </Card>
          ))}

          {(!course.reviews || course.reviews.length === 0) && (
            <p className="text-xs text-gray-400 italic">Aún no hay reseñas para este curso. ¡Sé el primero en dejar una!</p>
          )}
        </div>
      </div>

      {/* Review Submission Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Escribir Reseña para el Curso"
      >
        <form onSubmit={handleAddReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-2">
              Calificación General
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= reviewRating ? 'fill-amber-400' : 'text-gray-300 dark:text-gray-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
              Tu Comentario
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="¿Qué fue lo que más te gustó de las lecciones interactivas?"
              rows={4}
              className="w-full p-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E0E0] dark:border-[#2D2D2D]">
            <Button type="button" variant="ghost" onClick={() => setIsReviewModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingReview}>
              Publicar Reseña
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
