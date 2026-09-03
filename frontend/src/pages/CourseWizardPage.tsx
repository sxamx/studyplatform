import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Send,
} from 'lucide-react';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Badge } from '../components/shared/Badge';
import { VisualLessonEditor } from '../components/admin/editor/VisualLessonEditor';
import { LessonJSON } from '../types';
import { apiFetch } from '../api/client';

interface ProposedLesson {
  id: string;
  title: string;
  estimatedMinutes: number;
  generatedJson?: LessonJSON;
}

interface ProposedModule {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  lessons: ProposedLesson[];
}

export const CourseWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 Form
  const [courseTitle, setCourseTitle] = useState('Desarrollo Fullstack con Python y React');
  const [courseDescription, setCourseDescription] = useState('Aprende a construir aplicaciones completas desde cero hasta despliegue.');
  const [courseTrack, setCourseTrack] = useState('track-backend');
  const [rawMaterial, setRawMaterial] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Proposed Outline
  const [modules, setModules] = useState<ProposedModule[]>([
    {
      id: 'mod_1',
      title: 'Módulo 1: Fundamentos y Entorno',
      description: 'Configuración inicial, tipos de datos y funciones.',
      estimatedHours: 4,
      lessons: [
        { id: 'les_1_1', title: 'Introducción y Setup del Entorno', estimatedMinutes: 30 },
        { id: 'les_1_2', title: 'Estructuras de Datos Esenciales', estimatedMinutes: 45 },
      ],
    },
    {
      id: 'mod_2',
      title: 'Módulo 2: APIs y Asincronismo',
      description: 'Creación de endpoints REST y manejo de concurrencia.',
      estimatedHours: 6,
      lessons: [
        { id: 'les_2_1', title: 'Diseño de APIs con FastAPI', estimatedMinutes: 60 },
        { id: 'les_2_2', title: 'Bases de Datos Relacionales y ORM', estimatedMinutes: 50 },
      ],
    },
  ]);

  // Step 3 Selected Lesson for Editing
  const [activeEditingLesson, setActiveEditingLesson] = useState<{
    moduleId: string;
    lessonId: string;
  } | null>(null);

  // Step 1: AI Proposal Generation
  const handleAnalyzeMaterial = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setModules([
        {
          id: `mod_${Date.now()}_1`,
          title: `Módulo 1: Arquitectura y Bases de ${courseTitle}`,
          description: 'Conceptos fundamentales, sintaxis y reglas principales.',
          estimatedHours: 5,
          lessons: [
            { id: `les_${Date.now()}_1`, title: 'Visión General y Primeros Pasos', estimatedMinutes: 40 },
            { id: `les_${Date.now()}_2`, title: 'Sintaxis y Tipos de Datos Clave', estimatedMinutes: 50 },
          ],
        },
        {
          id: `mod_${Date.now()}_2`,
          title: `Módulo 2: Lógica Avanzada y Práctica`,
          description: 'Estructuras de control, patrones de diseño y ejercicios interactivos.',
          estimatedHours: 7,
          lessons: [
            { id: `les_${Date.now()}_3`, title: 'Estructuras de Control y Métodos', estimatedMinutes: 60 },
            { id: `les_${Date.now()}_4`, title: 'Reto Práctico Integrador', estimatedMinutes: 45 },
          ],
        },
      ]);
    }, 1200);
  };

  const handleAddModule = () => {
    const newMod: ProposedModule = {
      id: `mod_${Date.now()}`,
      title: `Nuevo Módulo ${modules.length + 1}`,
      description: 'Descripción del módulo temático',
      estimatedHours: 4,
      lessons: [
        { id: `les_${Date.now()}_1`, title: 'Primera Lección del Módulo', estimatedMinutes: 45 },
      ],
    };
    setModules([...modules, newMod]);
  };

  const handleRemoveModule = (modId: string) => {
    setModules(modules.filter((m) => m.id !== modId));
  };

  const handleAddLessonToModule = (modId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id === modId) {
          return {
            ...m,
            lessons: [
              ...m.lessons,
              {
                id: `les_${Date.now()}`,
                title: `Nueva Lección ${m.lessons.length + 1}`,
                estimatedMinutes: 45,
              },
            ],
          };
        }
        return m;
      })
    );
  };

  const handleRemoveLessonFromModule = (modId: string, lessonId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id === modId) {
          return {
            ...m,
            lessons: m.lessons.filter((l) => l.id !== lessonId),
          };
        }
        return m;
      })
    );
  };

  const getActiveLessonJson = (): LessonJSON => {
    if (!activeEditingLesson) {
      return {
        version: '1.0',
        lesson: {
          id: 'temp_lesson',
          title: 'Lección de Ejemplo',
          order: 1,
          blocks: [
            { type: 'heading', id: 'h1', level: 1, content: 'Introducción' },
            { type: 'text', id: 't1', content: 'Contenido interactivo de la lección...' },
          ],
        },
      };
    }

    const mod = modules.find((m) => m.id === activeEditingLesson.moduleId);
    const les = mod?.lessons.find((l) => l.id === activeEditingLesson.lessonId);

    if (les?.generatedJson) {
      return les.generatedJson;
    }

    return {
      version: '1.0',
      lesson: {
        id: les?.id || 'temp_lesson',
        title: les?.title || 'Nueva Lección',
        order: 1,
        estimatedMinutes: les?.estimatedMinutes || 45,
        blocks: [
          { type: 'heading', id: 'h_1', level: 1, content: les?.title || 'Título' },
          { type: 'text', id: 't_1', content: 'Explicación del concepto central.' },
          { type: 'code', id: 'c_1', language: 'python', code: '# Código de ejemplo\nprint("Hola Mundo")' },
          {
            type: 'question_choice',
            id: 'q_1',
            question: '¿Qué resultado muestra el código?',
            options: [
              { id: 'o1', text: 'Hola Mundo', isCorrect: true },
              { id: 'o2', text: 'Error', isCorrect: false },
            ],
            explanation: 'La función print imprime el texto en pantalla.',
          },
        ],
      },
    };
  };

  const handleSaveLessonJson = async (json: LessonJSON) => {
    if (!activeEditingLesson) return;
    setModules(
      modules.map((m) => {
        if (m.id === activeEditingLesson.moduleId) {
          return {
            ...m,
            lessons: m.lessons.map((l) => {
              if (l.id === activeEditingLesson.lessonId) {
                return { ...l, generatedJson: json, title: json.lesson.title };
              }
              return l;
            }),
          };
        }
        return m;
      })
    );
  };

  // Step 4: Publish Full Course to Backend (Single Atomic Request)
  const handlePublishCourse = async () => {
    try {
      setIsAnalyzing(true);
      const payload = {
        course: {
          title: courseTitle,
          description: courseDescription,
          trackId: courseTrack,
          isPublished: true,
          modules: modules.map((mod, i) => ({
            id: mod.id,
            title: mod.title,
            description: mod.description,
            order: i + 1,
            estimatedHours: mod.estimatedHours,
            lessons: mod.lessons.map((les, j) => {
              const fullJson = les.generatedJson || {
                version: '1.0',
                lesson: {
                  id: `les_${i + 1}_${j + 1}`,
                  title: les.title,
                  order: j + 1,
                  estimatedMinutes: les.estimatedMinutes,
                  blocks: [
                    { type: 'heading', id: 'h1', level: 1, content: les.title },
                    { type: 'text', id: 't1', content: 'Contenido interactivo generado para ' + les.title },
                  ],
                },
              };
              return {
                id: `les_${i + 1}_${j + 1}`,
                title: les.title,
                order: j + 1,
                estimatedMinutes: les.estimatedMinutes,
                blocks: fullJson.lesson?.blocks || [{ type: 'heading', id: 'h1', level: 1, content: les.title }],
              };
            }),
          })),
        },
      };

      const res = await apiFetch<any>('/upload/json', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const courseId = res.courseId;
      alert('¡Curso y módulos publicados con éxito!');
      navigate(`/courses/${courseId}`);
    } catch (err: any) {
      alert(err.message || 'Error al publicar el curso');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Wizard Step Progress Bar */}
      <div className="bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          {[
            { step: 1, label: '1. Análisis y Módulos', icon: Sparkles },
            { step: 2, label: '2. Temario de Lecciones', icon: Layers },
            { step: 3, label: '3. Editor de Bloques', icon: Edit2 },
            { step: 4, label: '4. Publicación', icon: CheckCircle2 },
          ].map((item) => {
            const Icon = item.icon;
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <div key={item.step} className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    isCurrent
                      ? 'bg-[#0066CC] dark:bg-[#4D94FF] text-white shadow-md'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs font-bold hidden sm:inline ${
                    isCurrent
                      ? 'text-[#0066CC] dark:text-[#4D94FF]'
                      : isCompleted
                      ? 'text-emerald-500'
                      : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Analizador de Material */}
      {currentStep === 1 && (
        <Card className="p-8 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0066CC] dark:text-[#4D94FF]">
              Paso 1 de 4: Estructuración
            </span>
            <h2 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-white">
              Análisis de Material y Módulos
            </h2>
            <p className="text-xs text-[#666666] dark:text-[#B0B0B0] mt-1">
              Ingresa los datos generales del curso o pega material de referencia para que la IA proponga los módulos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Título del Curso"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="Ej. Python Avanzado"
              required
            />
            <Input
              label="Descripción Corta"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              placeholder="¿Qué aprenderá el estudiante?"
              required
            />
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
                Ruta de Aprendizaje
              </label>
              <select
                value={courseTrack}
                onChange={(e) => setCourseTrack(e.target.value)}
                className="w-full h-11 px-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
              >
                <option value="track-backend">Desarrollo Backend</option>
                <option value="track-fundamentals">Fundamentos de Algoritmia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
              Material de Referencia (Temario, PDF transcrito o Notas)
            </label>
            <textarea
              value={rawMaterial}
              onChange={(e) => setRawMaterial(e.target.value)}
              placeholder="Pega aquí el temario, apuntes o temas clave que debe cubrir el curso..."
              rows={4}
              className="w-full p-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#E0E0E0] dark:border-[#2D2D2D]">
            <Button
              variant="outline"
              onClick={handleAnalyzeMaterial}
              isLoading={isAnalyzing}
              leftIcon={<Sparkles className="w-4 h-4 text-[#0066CC]" />}
            >
              Proponer Módulos con IA
            </Button>
            <Button
              variant="primary"
              onClick={() => setCurrentStep(2)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continuar a Lecciones
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Lecciones del Módulo */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0066CC] dark:text-[#4D94FF]">
                Paso 2 de 4: Temario Detallado
              </span>
              <h2 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-white">
                Módulos y Lecciones Propuestas
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddModule} leftIcon={<Plus className="w-4 h-4" />}>
              Añadir Módulo
            </Button>
          </div>

          <div className="space-y-4">
            {modules.map((mod, modIdx) => (
              <Card key={mod.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E0E0E0] dark:border-[#2D2D2D] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-[#0066CC]/10 text-[#0066CC] dark:text-[#4D94FF] rounded-lg text-xs font-bold">
                      Módulo {modIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) => {
                        const updated = [...modules];
                        updated[modIdx].title = e.target.value;
                        setModules(updated);
                      }}
                      className="font-bold text-base bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#0066CC] text-[#1A1A1A] dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {mod.estimatedHours}h est.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(mod.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lessons inside Module */}
                <div className="space-y-2 pl-4">
                  {mod.lessons.map((les, lesIdx) => (
                    <div
                      key={les.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl text-xs border border-[#E0E0E0] dark:border-[#2D2D2D]"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-[#1A1A1A] dark:text-white">
                          {modIdx + 1}.{lesIdx + 1} {les.title}
                        </span>
                        <span className="text-gray-400">({les.estimatedMinutes} min)</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setActiveEditingLesson({ moduleId: mod.id, lessonId: les.id });
                            setCurrentStep(3);
                          }}
                          leftIcon={<Edit2 className="w-3 h-3" />}
                        >
                          Editar Bloques
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleRemoveLessonFromModule(mod.id, les.id)}
                          className="p-1 text-rose-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddLessonToModule(mod.id)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="text-xs text-[#0066CC] dark:text-[#4D94FF]"
                  >
                    + Agregar lección a este módulo
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Atrás
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (modules[0]?.lessons[0]) {
                  setActiveEditingLesson({
                    moduleId: modules[0].id,
                    lessonId: modules[0].lessons[0].id,
                  });
                }
                setCurrentStep(3);
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Editar Lecciones (Paso 3)
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Visual Lesson Editor */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0066CC] dark:text-[#4D94FF]">
                Paso 3 de 4: Contenido Interactivo
              </span>
              <h2 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-white">
                Editor Visual de Lección
              </h2>
            </div>

            {/* Quick switcher between lessons */}
            <div className="flex items-center gap-2">
              <select
                value={activeEditingLesson ? `${activeEditingLesson.moduleId}:${activeEditingLesson.lessonId}` : ''}
                onChange={(e) => {
                  const [mId, lId] = e.target.value.split(':');
                  setActiveEditingLesson({ moduleId: mId, lessonId: lId });
                }}
                className="h-9 px-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-xs font-semibold text-[#1A1A1A] dark:text-white"
              >
                {modules.flatMap((m, mIdx) =>
                  m.lessons.map((l, lIdx) => (
                    <option key={l.id} value={`${m.id}:${l.id}`}>
                      M{mIdx + 1}.L{lIdx + 1}: {l.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <VisualLessonEditor
            key={activeEditingLesson ? `${activeEditingLesson.moduleId}_${activeEditingLesson.lessonId}` : 'editor'}
            initialLessonJson={getActiveLessonJson()}
            onSave={handleSaveLessonJson}
            lessonTitle={
              modules
                .find((m) => m.id === activeEditingLesson?.moduleId)
                ?.lessons.find((l) => l.id === activeEditingLesson?.lessonId)?.title
            }
          />

          <div className="flex justify-between pt-6 border-t border-[#E0E0E0] dark:border-[#2D2D2D]">
            <Button variant="outline" onClick={() => setCurrentStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Volver a Temario
            </Button>
            <Button variant="primary" onClick={() => setCurrentStep(4)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Revisión y Publicación (Paso 4)
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Review Global */}
      {currentStep === 4 && (
        <Card className="p-8 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Paso 4 de 4: Listo para Publicar
            </span>
            <h2 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-white">
              Resumen Final del Curso
            </h2>
            <p className="text-xs text-[#666666] dark:text-[#B0B0B0] mt-1">
              Revisa la estructura completa antes de publicar el curso para los estudiantes.
            </p>
          </div>

          <div className="p-5 bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl border border-[#E0E0E0] dark:border-[#2D2D2D] space-y-3">
            <h3 className="font-bold text-lg text-[#1A1A1A] dark:text-white">{courseTitle}</h3>
            <p className="text-xs text-[#666666] dark:text-[#B0B0B0]">{courseDescription}</p>
            <div className="flex gap-4 pt-2 text-xs font-semibold text-gray-500">
              <span>📚 {modules.length} Módulos</span>
              <span>📄 {modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lecciones Totales</span>
            </div>
          </div>

          <div className="space-y-3">
            {modules.map((m, idx) => (
              <div key={m.id} className="p-4 border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl text-xs space-y-2">
                <p className="font-bold text-sm text-[#0066CC] dark:text-[#4D94FF]">
                  Módulo {idx + 1}: {m.title}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {m.lessons.map((l) => (
                    <div key={l.id} className="p-2 bg-white dark:bg-[#141414] rounded border border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-between">
                      <span className="font-medium text-[#1A1A1A] dark:text-white">{l.title}</span>
                      <Badge variant="success" size="sm">Listo</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-[#E0E0E0] dark:border-[#2D2D2D]">
            <Button variant="outline" onClick={() => setCurrentStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Atrás
            </Button>
            <Button
              variant="primary"
              onClick={handlePublishCourse}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Publicar Curso Completo
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
