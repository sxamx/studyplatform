import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  CheckCircle2,
  XCircle,
  Layers,
  FileText,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Check,
  Diff,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import { apiFetch } from '../../api/client';
import { CourseReview } from '../../types';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';

interface CourseReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewsChange?: () => void;
}

export const CourseReviewModal: React.FC<CourseReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewsChange,
}) => {
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<CourseReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [adminFeedback, setAdminFeedback] = useState('');
  const [isDeciding, setIsDeciding] = useState(false);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<{ reviews: CourseReview[] }>('/admin/course-reviews');
      setReviews(data.reviews || []);
      if (data.reviews && data.reviews.length > 0 && !selectedReview) {
        loadReviewDetail(data.reviews[0].id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al cargar revisiones');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviewDetail = async (id: string) => {
    try {
      const data = await apiFetch<{ review: CourseReview }>(`/admin/course-reviews/${id}`);
      setSelectedReview(data.review);
      setAdminFeedback(data.review.adminFeedback || '');
    } catch (err: any) {
      alert(err.message || 'Error al cargar detalle de revisión');
    }
  };

  const selectReview = (id: string) => {
    loadReviewDetail(id);
  };

  useEffect(() => {
    if (isOpen) {
      loadReviews();
    }
  }, [isOpen]);

  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (!selectedReview) return;
    try {
      setIsDeciding(true);
      await apiFetch(`/admin/course-reviews/${selectedReview.id}/decision`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminFeedback }),
      });
      await loadReviews();
      if (onReviewsChange) onReviewsChange();
      setSelectedReview(null);
    } catch (err: any) {
      alert(err.message || 'Error al procesar decisión');
    } finally {
      setIsDeciding(false);
    }
  };

  if (!isOpen) return null;

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const calculateDiff = (proposed?: any | null, current?: any | null) => {
    if (!proposed) return null;
    const isDeletion = selectedReview?.reviewType === 'deletion';
    if (isDeletion) {
      return {
        isNew: false,
        isDeletion: true,
        isMetaModified: false,
        addedLessons: [],
        deletedLessons: [],
        modifiedLessons: [],
        totalChanges: 1,
      };
    }
    const isNew = !current;

    const proposedLessons = proposed.lessons || [];
    const currentLessons = current?.lessons || [];

    const currentMap = new Map(currentLessons.map((l: any) => [l.id, l]));
    const proposedMap = new Map(proposedLessons.map((l: any) => [l.id, l]));

    const addedLessons = proposedLessons.filter((l: any) => !currentMap.has(l.id));
    const deletedLessons = currentLessons.filter((l: any) => !proposedMap.has(l.id));
    const modifiedLessons = proposedLessons.filter((l: any) => {
      const c: any = currentMap.get(l.id);
      if (!c) return false;
      return (
        c.title !== l.title ||
        c.description !== l.description ||
        c.estimatedMinutes !== l.estimatedMinutes ||
        JSON.stringify(c.blocks || []) !== JSON.stringify(l.blocks || [])
      );
    });

    const proposedCourse = proposed.course || proposed;
    const currentCourse = current?.course || current;

    const isMetaModified =
      Boolean(currentCourse &&
      proposedCourse &&
      (currentCourse.title !== proposedCourse.title ||
        currentCourse.description !== proposedCourse.description ||
        currentCourse.thumbnailUrl !== proposedCourse.thumbnailUrl ||
        currentCourse.sequentialUnlock !== proposedCourse.sequentialUnlock));

    return {
      isNew,
      isDeletion: false,
      isMetaModified,
      addedLessons,
      deletedLessons,
      modifiedLessons,
      totalChanges: addedLessons.length + deletedLessons.length + modifiedLessons.length + (isMetaModified ? 1 : 0),
    };
  };

  const diffData = selectedReview ? calculateDiff(selectedReview.proposedData, selectedReview.currentData) : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] w-screen h-screen min-h-screen min-w-full flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[88vh] max-h-[88vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-emerald-50/30 to-transparent dark:from-blue-950/20 dark:via-emerald-950/10 dark:to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Diff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white tracking-tight flex items-center gap-2">
                <span>Whitelist & Revisiones de Cursos</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
                  {reviews.filter((r) => r.status === 'pending').length} pendientes
                </span>
              </h2>
              <p className="text-xs text-[#666666] dark:text-[#808080]">
                Supervisa cursos nuevos y compara diferencias (Diff) en actualizaciones antes de publicar en Marketplace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#242424] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-3 border-b border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-between gap-2 bg-gray-50/50 dark:bg-[#181818]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 mr-2">Filtrar:</span>
            {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  filter === f
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-[#242424] text-gray-600 dark:text-gray-300 border border-[#E0E0E0] dark:border-[#2D2D2D]'
                }`}
              >
                {f === 'pending' && 'Pendientes'}
                {f === 'approved' && 'Aprobadas'}
                {f === 'rejected' && 'Rechazadas'}
                {f === 'all' && 'Todas'}
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Two-Column Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Reviews List */}
          <div className="w-full md:w-80 border-r border-[#E0E0E0] dark:border-[#2D2D2D] overflow-y-auto p-3 space-y-2 bg-gray-50/30 dark:bg-[#141414]">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-gray-400">Cargando revisiones...</div>
            ) : filteredReviews.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                No hay solicitudes de revisión con este filtro.
              </div>
            ) : (
              filteredReviews.map((r) => {
                const isSelected = selectedReview?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => selectReview(r.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-xs ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 shadow-sm'
                        : 'bg-white dark:bg-[#1A1A1A] border-[#E0E0E0] dark:border-[#2D2D2D] hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#1A1A1A] dark:text-white truncate max-w-[140px]">
                        {r.courseTitle || 'Curso'}
                      </span>
                      <Badge
                        variant={
                          r.status === 'approved'
                            ? 'success'
                            : r.status === 'rejected'
                            ? 'error'
                            : 'warning'
                        }
                      >
                        {r.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                      <span className="truncate">{r.creatorName || r.creatorEmail}</span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#2A2A2A] font-medium text-[10px]">
                        {r.reviewType === 'new_course' ? 'Nuevo' : 'Actualización'}
                      </span>
                    </div>

                    <div className="text-[10px] text-gray-400 mt-2">
                      {new Date(r.createdAt).toLocaleDateString()} a las{' '}
                      {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Diff Visualizer & Decision */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#171717]">
            {selectedReview ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Review Header Bar */}
                <div className="p-5 border-b border-[#E0E0E0] dark:border-[#2D2D2D] bg-gray-50/40 dark:bg-[#1A1A1A] flex flex-wrap items-center justify-between gap-4 shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">
                        {selectedReview.courseTitle}
                      </h3>
                      <Badge
                        variant={
                          selectedReview.reviewType === 'deletion'
                            ? 'error'
                            : selectedReview.reviewType === 'new_course'
                            ? 'primary'
                            : 'warning'
                        }
                      >
                        {selectedReview.reviewType === 'deletion'
                          ? '🗑️ SOLICITUD DE ELIMINACIÓN'
                          : selectedReview.reviewType === 'new_course'
                          ? '🌱 NUEVO CURSO'
                          : '🔄 ACTUALIZACIÓN'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Autor: <strong className="text-gray-800 dark:text-gray-200">{selectedReview.creatorName}</strong> ({selectedReview.creatorEmail})
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {selectedReview.status !== 'approved' && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isDeciding}
                        onClick={() => handleDecision('approved')}
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                        className={
                          selectedReview.reviewType === 'deletion'
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }
                      >
                        {selectedReview.reviewType === 'deletion' ? 'Aprobar Eliminación' : 'Aprobar y Publicar'}
                      </Button>
                    )}
                    {selectedReview.status !== 'rejected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isDeciding}
                        onClick={() => handleDecision('rejected')}
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        className="text-rose-600 hover:text-rose-700"
                      >
                        {selectedReview.reviewType === 'deletion' ? 'Rechazar Solicitud' : 'Rechazar'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Diff Viewer Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
                  {/* Diff Summary Cards */}
                  {diffData && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <PlusCircle className="w-3 h-3" />
                          <span>Lecciones Nuevas</span>
                        </span>
                        <div className="text-xl font-black text-emerald-800 dark:text-emerald-200 mt-1">
                          +{diffData.addedLessons.length}
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                        <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                          <Diff className="w-3 h-3" />
                          <span>Lecciones Editadas</span>
                        </span>
                        <div className="text-xl font-black text-amber-800 dark:text-amber-200 mt-1">
                          ~{diffData.modifiedLessons.length}
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                        <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                          <MinusCircle className="w-3 h-3" />
                          <span>Lecciones Borradas</span>
                        </span>
                        <div className="text-xl font-black text-rose-800 dark:text-rose-200 mt-1">
                          -{diffData.deletedLessons.length}
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                        <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>Total en Temario</span>
                        </span>
                        <div className="text-xl font-black text-blue-800 dark:text-blue-200 mt-1">
                          {selectedReview.proposedData?.lessons?.length || 0}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visual Diff of Lessons List */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-[#1A1A1A] dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#0066CC]" />
                      <span>Detalle de Diferencias en el Temario</span>
                    </h4>

                    {diffData?.isDeletion ? (
                      <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-3">
                        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-sm">
                          <AlertCircle className="w-5 h-5" />
                          <span>Solicitud de Retiro y Eliminación Definitiva</span>
                        </div>
                        <p className="text-xs text-rose-900 dark:text-rose-100 leading-relaxed">
                          El creador <strong>{selectedReview.creatorName}</strong> ({selectedReview.creatorEmail}) ha solicitado eliminar permanentemente este curso de la plataforma StudyPlatform.
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Motivo / Nota del autor: <em>"{selectedReview.adminFeedback || 'Solicitud de eliminación por el creador'}"</em>
                        </p>
                        <div className="p-3 rounded-xl bg-white dark:bg-[#1E1E1E] border border-rose-100 dark:border-rose-950/50 text-xs text-gray-600 dark:text-gray-300">
                          ⚠️ Al hacer clic en <strong>"Aprobar Eliminación"</strong>, el curso, módulos y lecciones asociadas serán borrados de la base de datos de producción.
                        </div>
                      </div>
                    ) : diffData?.isNew ? (
                      <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-2">
                        <div className="font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Curso Nuevo Completo ({selectedReview.proposedData?.lessons?.length || 0} Lecciones)</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedReview.proposedData?.course?.description || selectedReview.proposedData?.description}
                        </p>
                        <div className="space-y-1.5 pt-2">
                          {selectedReview.proposedData?.lessons?.map((l: any, i: number) => (
                            <div key={l.id} className="p-2.5 rounded-xl bg-white dark:bg-[#202020] border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                {i + 1}. {l.title}
                              </span>
                              <span className="text-[10px] text-gray-400">{l.estimatedMinutes || 10} min • {l.blocksCount || 0} bloques</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Diff for updates */
                      <div className="space-y-2">
                        {/* Added Lessons */}
                        {diffData?.addedLessons.map((l: any) => (
                          <div key={l.id} className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <PlusCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="font-bold text-emerald-900 dark:text-emerald-100">{l.title}</span>
                            </div>
                            <Badge variant="success">+ AÑADIDA</Badge>
                          </div>
                        ))}

                        {/* Modified Lessons with expandable Block Viewer */}
                        {diffData?.modifiedLessons.map((l: any) => {
                          const isExpanded = expandedLessonId === l.id;
                          return (
                            <div key={l.id} className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 overflow-hidden">
                              <div
                                onClick={() => setExpandedLessonId(isExpanded ? null : l.id)}
                                className="p-3 flex items-center justify-between cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition"
                              >
                                <div className="flex items-center gap-2">
                                  {isExpanded ? <ChevronDown className="w-4 h-4 text-amber-600" /> : <ChevronRight className="w-4 h-4 text-amber-600" />}
                                  <span className="font-bold text-amber-900 dark:text-amber-100">{l.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-amber-700 dark:text-amber-300">{l.blocksCount} bloques</span>
                                  <Badge variant="warning">~ MODIFICADA</Badge>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="p-3 bg-white dark:bg-[#1E1E1E] border-t border-amber-200 dark:border-amber-900 space-y-2">
                                  <span className="text-[10px] uppercase font-bold text-gray-400">Contenido Propuesto</span>
                                  <div className="space-y-1">
                                    {(l.blocks || []).map((b: any, bIdx: number) => (
                                      <div key={bIdx} className="p-2 rounded bg-gray-50 dark:bg-[#282828] text-[11px] font-mono flex items-start gap-2">
                                        <span className="text-gray-400 text-[10px]">#{bIdx + 1}</span>
                                        <span className="font-bold text-purple-600 dark:text-purple-400">{b.type}</span>
                                        <span className="text-gray-700 dark:text-gray-300 truncate">
                                          {b.content || b.question || b.code || b.title || '(sin texto)'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Deleted Lessons */}
                        {diffData?.deletedLessons.map((l: any) => (
                          <div key={l.id} className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MinusCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span className="font-bold line-through text-rose-900 dark:text-rose-100">{l.title}</span>
                            </div>
                            <Badge variant="error">- ELIMINADA</Badge>
                          </div>
                        ))}

                        {diffData?.totalChanges === 0 && (
                          <div className="p-4 text-center text-gray-400">
                            No se detectaron diferencias en el contenido de las lecciones.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Feedback Textarea */}
                  <div className="space-y-1.5 pt-2">
                    <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">
                      Observaciones / Feedback para el Creador (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={adminFeedback}
                      onChange={(e) => setAdminFeedback(e.target.value)}
                      placeholder="Escribe comentarios sobre las lecciones o sugerencias de mejora..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#202020] text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-xs text-gray-400">
                Selecciona una solicitud en la lista izquierda para comparar las diferencias (Diff).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
