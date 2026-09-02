import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Upload,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  FileCode,
  Clock,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '../api/client';
import { CourseDetail, Module, LessonSummary, LessonJSON } from '../types';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Badge } from '../components/shared/Badge';
import { Modal } from '../components/shared/Modal';
import { Input } from '../components/shared/Input';
import { VisualLessonEditor } from '../components/admin/editor/VisualLessonEditor';
import { AIPromptsModal } from '../components/admin/AIPromptsModal';
import { CourseAIChatDrawer } from '../components/creator/CourseAIChatDrawer';

export const CourseCurriculumPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPromptsModalOpen, setIsPromptsModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Modals
  // 1. Module Modal (Create / Edit)
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [moduleHours, setModuleHours] = useState(4);

  // 2. Lesson Modal (Create new empty lesson)
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonMinutes, setLessonMinutes] = useState(20);

  // 3. Visual Lesson Editor Fullscreen Modal
  const [activeLessonJson, setActiveLessonJson] = useState<LessonJSON | null>(null);
  const [activeLessonTitle, setActiveLessonTitle] = useState<string>('');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // 4. Import / Paste JSON Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTargetModuleId, setImportTargetModuleId] = useState<string | null>(null);
  const [rawJsonInput, setRawJsonInput] = useState('');
  const [importError, setImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Drag & Drop File Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [loadedFilesInfo, setLoadedFilesInfo] = useState<{ name: string; type: string }[]>([]);

  const loadCourse = async (showLoading = true) => {
    if (!id) return;
    if (showLoading) setIsLoading(true);
    try {
      const data = await apiFetch<CourseDetail>(`/courses/${id}`);
      setCourse(data);
    } catch (err) {
      console.error('Error loading course curriculum:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourse(true);
  }, [id]);

  // Copy Lesson JSON to Clipboard for AI Prompting
  const handleCopyLessonJson = async (lessonId: string) => {
    try {
      const lessonDetail = await apiFetch<any>(`/lessons/${lessonId}`);
      if (lessonDetail && lessonDetail.content) {
        await navigator.clipboard.writeText(JSON.stringify(lessonDetail.content, null, 2));
        setCopiedId(lessonId);
        setTimeout(() => setCopiedId(null), 2500);
      }
    } catch (err) {
      alert('No se pudo obtener el JSON de la lección.');
    }
  };

  // Copy Full Course JSON Schema
  const handleCopyFullCourseJson = async () => {
    if (!course) return;
    try {
      const allLessons = await Promise.all(
        course.lessons.map((l) => apiFetch<any>(`/lessons/${l.id}`).catch(() => null))
      );
      const fullExport = {
        courseTitle: course.title,
        courseDescription: course.description,
        modules: course.modules?.map((m) => ({
          title: m.title,
          description: m.description,
          lessons: m.lessons?.map((l) => {
            const found = allLessons.find((al) => al && al.id === l.id);
            return found?.content || { title: l.title };
          }),
        })),
      };
      await navigator.clipboard.writeText(JSON.stringify(fullExport, null, 2));
      alert('¡Esquema completo del curso copiado al portapapeles! Listo para pasárselo a la IA.');
    } catch (err) {
      alert('Error al exportar el curso completo.');
    }
  };

  // Open Visual Lesson Editor
  const handleOpenVisualEditor = async (lessonSummary: LessonSummary) => {
    try {
      const lessonDetail = await apiFetch<any>(`/lessons/${lessonSummary.id}`);
      setActiveLessonId(lessonSummary.id);
      setActiveLessonTitle(lessonSummary.title);
      setActiveLessonJson(
        lessonDetail.content || {
          version: '1.0',
          lesson: {
            id: lessonSummary.id,
            title: lessonSummary.title,
            order: lessonSummary.order,
            estimatedMinutes: lessonSummary.estimatedMinutes,
            blocks: [{ type: 'heading', id: 'h1', level: 1, content: lessonSummary.title }],
          },
        }
      );
    } catch (err) {
      alert('Error al abrir la lección.');
    }
  };

  // Save Lesson from Visual Editor (Seamless, No Reload / No Flicker)
  const handleSaveLessonJson = async (updatedJson: LessonJSON) => {
    if (!activeLessonId) return;
    try {
      await apiFetch(`/lessons/${activeLessonId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: updatedJson.lesson.title,
          description: updatedJson.lesson.description,
          estimatedMinutes: updatedJson.lesson.estimatedMinutes,
          content: updatedJson,
        }),
      });
      // Silent refresh of course list in background without reloading the page or closing the editor
      await loadCourse(false);
    } catch (err: any) {
      console.error('Error saving lesson in background:', err);
    }
  };

  // Create or Update Module
  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !moduleTitle.trim()) return;

    try {
      if (editingModule) {
        await apiFetch(`/modules/${editingModule.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: moduleTitle.trim(),
            description: moduleDescription.trim(),
            estimatedHours: moduleHours,
          }),
        });
      } else {
        await apiFetch('/modules', {
          method: 'POST',
          body: JSON.stringify({
            courseId: id,
            title: moduleTitle.trim(),
            description: moduleDescription.trim(),
            orderIndex: (course?.modules?.length || 0) + 1,
            estimatedHours: moduleHours,
          }),
        });
      }
      setIsModuleModalOpen(false);
      loadCourse();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el módulo');
    }
  };

  // Delete Module
  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('¿Eliminar este módulo y desvincular sus lecciones?')) return;
    try {
      await apiFetch(`/modules/${moduleId}`, { method: 'DELETE' });
      loadCourse();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  // Create New Lesson
  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !lessonTitle.trim()) return;

    try {
      await apiFetch('/lessons', {
        method: 'POST',
        body: JSON.stringify({
          courseId: id,
          moduleId: targetModuleId,
          title: lessonTitle.trim(),
          description: lessonDescription.trim(),
          estimatedMinutes: lessonMinutes,
          orderIndex: (course?.lessons.length || 0) + 1,
        }),
      });
      setIsLessonModalOpen(false);
      loadCourse();
    } catch (err: any) {
      alert(err.message || 'Error al crear la lección');
    }
  };

  // Toggle Course Visibility (Publish / Unpublish)
  const handleTogglePublish = async () => {
    if (!course) return;
    try {
      await apiFetch(`/courses/${course.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });
      loadCourse(false);
    } catch (err: any) {
      alert(err.message || 'Error al cambiar visibilidad');
    }
  };

  // Move / Assign Lesson to Module
  const handleAssignLessonToModule = async (lessonId: string, targetModId: string | null) => {
    try {
      await apiFetch(`/lessons/${lessonId}`, {
        method: 'PUT',
        body: JSON.stringify({ moduleId: targetModId }),
      });
      loadCourse(false);
    } catch (err: any) {
      alert(err.message || 'Error al asignar lección al módulo');
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta lección permanentemente?')) return;
    try {
      await apiFetch(`/lessons/${lessonId}`, { method: 'DELETE' });
      loadCourse(false);
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  // Import / Upload JSON
  const handleImportJson = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    setIsImporting(true);

    try {
      let parsed: any;
      try {
        parsed = JSON.parse(rawJsonInput);
      } catch {
        throw new Error('El texto ingresado no es un JSON válido.');
      }

      await apiFetch('/upload/json', {
        method: 'POST',
        body: JSON.stringify({
          courseId: id,
          moduleId: importTargetModuleId,
          jsonContent: parsed,
        }),
      });

      setIsImportModalOpen(false);
      setRawJsonInput('');
      loadCourse();
    } catch (err: any) {
      setImportError(err.message || 'Error al validar e importar JSON');
    } finally {
      setIsImporting(false);
    }
  };

  // Process single or multiple JSON files (from file picker or Drag & Drop)
  const processJsonFiles = async (filesList: File[]) => {
    setImportError('');
    const jsonFiles = filesList.filter(
      (f) => f.name.endsWith('.json') || f.type.includes('json') || f.type === ''
    );

    if (jsonFiles.length === 0) {
      setImportError('No se encontraron archivos con extensión .json en la selección.');
      return;
    }

    const filesInfo: { name: string; type: string }[] = [];

    if (jsonFiles.length === 1) {
      try {
        const text = await jsonFiles[0].text();
        const parsed = JSON.parse(text);
        setRawJsonInput(JSON.stringify(parsed, null, 2));
        const fileKind = parsed.course || parsed.modules
          ? 'Curso Completo'
          : (parsed.lesson || parsed.blocks ? 'Lección' : 'JSON');
        filesInfo.push({ name: jsonFiles[0].name, type: fileKind });
      } catch (err: any) {
        setImportError(`Error de sintaxis en "${jsonFiles[0].name}": ${err.message}`);
      }
    } else {
      let courseManifest: any = null;
      const lessonFiles: { name: string; content: any }[] = [];
      const errors: string[] = [];

      for (const file of jsonFiles) {
        try {
          const text = await file.text();
          const parsed = JSON.parse(text);
          const lower = file.name.toLowerCase();

          if (
            lower === 'course.json' ||
            lower === 'manifest.json' ||
            lower === 'index.json' ||
            parsed.course ||
            (parsed.title && parsed.modules)
          ) {
            courseManifest = parsed;
            filesInfo.push({ name: file.name, type: 'Manifiesto del Curso' });
          } else {
            lessonFiles.push({ name: file.name, content: parsed });
            filesInfo.push({ name: file.name, type: 'Lección' });
          }
        } catch (err: any) {
          errors.push(`Error en "${file.name}": ${err.message}`);
        }
      }

      if (errors.length > 0) {
        setImportError(errors.join(' | '));
      }

      const bundlePayload = courseManifest || lessonFiles.length > 0
        ? { manifest: courseManifest, lessons: lessonFiles }
        : null;

      if (bundlePayload) {
        setRawJsonInput(JSON.stringify(bundlePayload, null, 2));
      }
    }

    setLoadedFilesInfo(filesInfo);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      await processJsonFiles(filesArray);
    }
  };

  if (isLoading || !course) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 border-3 border-[#0066CC] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">Cargando temario del curso...</p>
      </div>
    );
  }

  const hasModules = course.modules && course.modules.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#666666] hover:text-[#1A1A1A] dark:text-[#B0B0B0] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Panel de Admin</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAiDrawerOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Copiloto IA
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsPromptsModalOpen(true)}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
          >
            Prompts para IA
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyFullCourseJson}
            leftIcon={<Copy className="w-3.5 h-3.5" />}
          >
            Copiar Temario
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/courses/${course.id}`)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Vista de Estudiante
          </Button>
        </div>
      </div>

      {/* Course Hero Banner */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-white to-[#F5F5F5] dark:from-[#1A1A1A] dark:to-[#141414]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">Editor de Estructura</Badge>
              <button
                type="button"
                onClick={handleTogglePublish}
                className="cursor-pointer hover:opacity-80 transition"
                title={course.isPublished ? 'Curso visible a estudiantes. Haz clic para ocultar.' : 'Curso oculto a estudiantes. Haz clic para publicar.'}
              >
                <Badge variant={course.isPublished ? 'success' : 'secondary'}>
                  {course.isPublished ? 'Publicado (Visible)' : 'Borrador (Oculto)'}
                </Badge>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] dark:text-white tracking-tight">
              {course.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] dark:text-[#B0B0B0]">
              {course.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={course.isPublished ? "outline" : "primary"}
              size="sm"
              onClick={handleTogglePublish}
              leftIcon={course.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            >
              {course.isPublished ? 'Ocultar a Estudiantes' : 'Publicar Curso'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setImportTargetModuleId(course.modules?.[0]?.id || null);
                setRawJsonInput('');
                setImportError('');
                setIsImportModalOpen(true);
              }}
              leftIcon={<Upload className="w-4 h-4 text-[#0066CC]" />}
            >
              Importar / Subir JSON
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingModule(null);
                setModuleTitle('');
                setModuleDescription('');
                setModuleHours(4);
                setIsModuleModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nuevo Módulo
            </Button>
          </div>
        </div>
      </Card>

      {/* Curriculum Modules & Lessons Accordion List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#E0E0E0] dark:border-[#2D2D2D] pb-3">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white tracking-tight">
            Módulos y Lecciones ({course.totalLessons} lecciones)
          </h2>
          <span className="text-xs text-gray-500 font-semibold">
            {course.modules?.length || 0} Módulos configurados
          </span>
        </div>

        {hasModules ? (
          <div className="space-y-6">
            {course.modules?.map((module, mIdx) => (
              <Card key={module.id} className="p-5 sm:p-6 space-y-4">
                {/* Module Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E0E0E0] dark:border-[#2D2D2D]">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#0066CC] dark:text-[#4D94FF] uppercase tracking-wider">
                      Módulo {mIdx + 1}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-white">
                      {module.title}
                    </h3>
                    {module.description && (
                      <p className="text-xs text-[#666666] dark:text-[#B0B0B0]">{module.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingModule(module);
                        setModuleTitle(module.title);
                        setModuleDescription(module.description || '');
                        setModuleHours(module.estimatedHours || 4);
                        setIsModuleModalOpen(true);
                      }}
                      title="Editar Módulo"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-500 hover:text-rose-600"
                      onClick={() => handleDeleteModule(module.id)}
                      title="Eliminar Módulo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTargetModuleId(module.id);
                        setLessonTitle('');
                        setLessonDescription('');
                        setLessonMinutes(20);
                        setIsLessonModalOpen(true);
                      }}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Añadir Lección
                    </Button>
                  </div>
                </div>

                {/* Lessons in this Module */}
                <div className="space-y-2.5">
                  {module.lessons && module.lessons.length > 0 ? (
                    module.lessons.map((lesson, lIdx) => (
                      <div
                        key={lesson.id}
                        className="p-3.5 bg-gray-50 dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl flex items-center justify-between gap-4 hover:border-[#0066CC] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-white dark:bg-[#202020] border border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-center font-bold text-xs shrink-0">
                            {mIdx + 1}.{lIdx + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-white truncate">
                              {lesson.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {lesson.estimatedMinutes} min
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCopyLessonJson(lesson.id)}
                            title="Copiar JSON de la lección para la IA"
                            leftIcon={
                              copiedId === lesson.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )
                            }
                          >
                            <span className="hidden sm:inline">
                              {copiedId === lesson.id ? 'Copiado' : 'Copiar JSON'}
                            </span>
                          </Button>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenVisualEditor(lesson)}
                            leftIcon={<FileCode className="w-3.5 h-3.5" />}
                          >
                            <span className="hidden sm:inline">Editor de Lección</span>
                            <span className="sm:hidden">Editar</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-500 hover:text-rose-600"
                            onClick={() => handleDeleteLesson(lesson.id)}
                            title="Eliminar Lección"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 border border-dashed border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl text-center text-xs text-gray-400">
                      Este módulo aún no tiene lecciones. Haz clic en "Añadir Lección" o "Importar JSON".
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        {/* Lecciones Sueltas / Sin Módulo Asignado (siempre visibles) */}
        {(() => {
          const unassigned = hasModules
            ? (course.lessons || []).filter((l) => !l.moduleId || !course.modules?.some((m) => m.id === l.moduleId))
            : (!hasModules ? (course.lessons || []) : []);

          if (unassigned.length === 0 && hasModules) return null;

          if (!hasModules && unassigned.length === 0) {
            return (
              <div className="p-8 border-2 border-dashed border-[#E0E0E0] dark:border-[#2D2D2D] rounded-2xl text-center space-y-3">
                <Layers className="w-8 h-8 text-gray-400 mx-auto" />
                <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-white">
                  No hay módulos ni lecciones definidos en este curso
                </h3>
                <p className="text-xs text-[#666666] dark:text-[#B0B0B0] max-w-md mx-auto">
                  Puedes crear módulos para organizar el temario o importar lecciones directamente en JSON.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingModule(null);
                    setModuleTitle('');
                    setModuleDescription('');
                    setModuleHours(4);
                    setIsModuleModalOpen(true);
                  }}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Crear Primer Módulo
                </Button>
              </div>
            );
          }

          return (
            <Card className="p-5 sm:p-6 border-amber-500/40 bg-amber-50/10 dark:bg-amber-950/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    {hasModules ? '⚠️ Lecciones Sin Módulo Asignado' : 'Lecciones del Curso'}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-white">
                    {hasModules ? `Lecciones Sueltas (${unassigned.length})` : `Todas las Lecciones (${unassigned.length})`}
                  </h3>
                  {hasModules && (
                    <p className="text-xs text-[#666666] dark:text-[#B0B0B0]">
                      Estas lecciones fueron importadas sin asignar módulo. Puedes editarlas o moverlas a cualquier módulo del curso.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                {unassigned.map((lesson, uIdx) => (
                  <div
                    key={lesson.id}
                    className="p-3.5 bg-white dark:bg-[#181818] border border-amber-500/30 dark:border-amber-900/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-500 transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {uIdx + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-white truncate">
                          {lesson.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {lesson.estimatedMinutes} min
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {course.modules && course.modules.length > 0 && (
                        <select
                          onChange={(e) => handleAssignLessonToModule(lesson.id, e.target.value)}
                          defaultValue=""
                          className="text-xs py-1.5 px-2 bg-gray-50 dark:bg-[#202020] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none"
                        >
                          <option value="" disabled>Mover a Módulo...</option>
                          {course.modules.map((m, mIdx) => (
                            <option key={m.id} value={m.id}>
                              Módulo {mIdx + 1}: {m.title}
                            </option>
                          ))}
                        </select>
                      )}

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopyLessonJson(lesson.id)}
                        title="Copiar JSON"
                        leftIcon={copiedId === lesson.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      >
                        <span className="hidden sm:inline">{copiedId === lesson.id ? 'Copiado' : 'Copiar JSON'}</span>
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenVisualEditor(lesson)}
                        leftIcon={<FileCode className="w-3.5 h-3.5" />}
                      >
                        <span>Editor</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-500 hover:text-rose-600"
                        onClick={() => handleDeleteLesson(lesson.id)}
                        title="Eliminar Lección"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })()}
      </div>

      {/* Modal: Fullscreen Visual Lesson Editor */}
      {activeLessonJson && (
        <Modal
          isOpen={Boolean(activeLessonJson)}
          onClose={() => setActiveLessonJson(null)}
          title={`Editor de Lección: ${activeLessonTitle}`}
          size="full"
        >
          <VisualLessonEditor
            initialLessonJson={activeLessonJson}
            onSave={handleSaveLessonJson}
            lessonTitle={activeLessonTitle}
          />
        </Modal>
      )}

      {/* Modal: Crear / Editar Módulo */}
      <Modal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        title={editingModule ? 'Editar Módulo' : 'Nuevo Módulo'}
      >
        <form onSubmit={handleModuleSubmit} className="space-y-4">
          <Input
            label="Título del Módulo"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            placeholder="Ej. Módulo 1: Sintaxis y Tipos de Datos"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
              Descripción del Módulo
            </label>
            <textarea
              value={moduleDescription}
              onChange={(e) => setModuleDescription(e.target.value)}
              placeholder="Resumen de los temas que cubre el módulo..."
              rows={3}
              className="w-full p-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
            />
          </div>

          <Input
            label="Horas Estimadas de Estudio"
            type="number"
            value={moduleHours}
            onChange={(e) => setModuleHours(Number(e.target.value))}
            min={1}
            max={100}
            required
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsModuleModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingModule ? 'Actualizar Módulo' : 'Crear Módulo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Crear Lección Rápida */}
      <Modal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        title="Añadir Nueva Lección al Módulo"
      >
        <form onSubmit={handleLessonSubmit} className="space-y-4">
          <Input
            label="Título de la Lección"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="Ej. Variables y Tipos Primitivos"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
              Descripción Corta
            </label>
            <textarea
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
              placeholder="¿Qué aprenderá el estudiante en esta lección?"
              rows={2}
              className="w-full p-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
            />
          </div>

          <Input
            label="Duración Estimada (Minutos)"
            type="number"
            value={lessonMinutes}
            onChange={(e) => setLessonMinutes(Number(e.target.value))}
            min={5}
            max={180}
            required
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsLessonModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Crear y Abrir Editor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Importar / Subir JSON */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Importar / Subir Lección JSON"
        size="lg"
      >
        <form onSubmit={handleImportJson} className="space-y-4">
          {hasModules && (
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
                Asignar al Módulo
              </label>
              <select
                value={importTargetModuleId || ''}
                onChange={(e) => setImportTargetModuleId(e.target.value || null)}
                className="w-full h-11 px-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
              >
                {course.modules?.map((m, idx) => (
                  <option key={m.id} value={m.id}>
                    Módulo {idx + 1}: {m.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
              Arrastrar o Seleccionar Archivos JSON
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors space-y-3 ${
                isDragging
                  ? 'border-[#0066CC] bg-[#0066CC]/10'
                  : 'border-[#E0E0E0] dark:border-[#2D2D2D] bg-gray-50/60 dark:bg-[#141414]/60 hover:border-[#0066CC]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                multiple
                onChange={(e) => {
                  if (e.target.files) processJsonFiles(Array.from(e.target.files));
                }}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-full bg-[#0066CC]/10 text-[#0066CC] flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>

              <div>
                <p className="text-xs font-bold text-[#1A1A1A] dark:text-white">
                  Arrastra aquí todos tus archivos .json o tu carpeta de curso
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  O haz clic en este recuadro para seleccionar múltiples archivos a la vez desde tu equipo
                </p>
              </div>

              {loadedFilesInfo.length > 0 && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-800 text-left max-h-36 overflow-y-auto space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    ✓ {loadedFilesInfo.length} Archivos cargados y listos:
                  </span>
                  {loadedFilesInfo.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
                      <span className="truncate font-mono">📄 {f.name}</span>
                      <Badge variant="primary" className="text-[9px] py-0 px-1.5">{f.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
              O Pega el Contenido JSON directamente aquí
            </label>
            <textarea
              value={rawJsonInput}
              onChange={(e) => setRawJsonInput(e.target.value)}
              placeholder='{ "version": "1.0", "lesson": { ... } }  o  { "course": { ... } }  o  [ { ... } ]'
              rows={6}
              className="w-full p-3 font-mono bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
              required
            />
          </div>

          {importError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {importError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsImportModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isImporting}>
              Validar e Importar
            </Button>
          </div>
        </form>
      </Modal>

      {/* AI Prompts Modal */}
      <AIPromptsModal
        isOpen={isPromptsModalOpen}
        onClose={() => setIsPromptsModalOpen(false)}
      />

      {/* Course AI Copilot Drawer */}
      {course && (
        <CourseAIChatDrawer
          isOpen={isAiDrawerOpen}
          onClose={() => setIsAiDrawerOpen(false)}
          courseId={course.id}
          courseTitle={course.title}
        />
      )}
    </div>
  );
};
