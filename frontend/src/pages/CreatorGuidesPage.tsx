import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ShieldCheck,
  Sparkles,
  Layers,
  FileCode,
  CheckCircle2,
  Copy,
  Check,
  ArrowLeft,
  Lightbulb,
  Code2,
  ListOrdered,
  FileText,
  Workflow,
  Sigma,
  Table,
  Download,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Badge } from '../components/shared/Badge';
import { REAL_MASTER_PROMPTS } from '../data/creatorPrompts';

export const CreatorGuidesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'workflow' | 'blocks' | 'prompts'>('rules');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(REAL_MASTER_PROMPTS[0].id);
  const navigate = useNavigate();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const blockExamples = [
    {
      type: 'diagram',
      title: 'Diagramas Mermaid.js',
      description: 'Genera diagramas de flujo, arquitectura y jerarquías de clases vectoriales dinámicas.',
      icon: <Workflow className="w-5 h-5 text-indigo-500" />,
      snippet: `{\n  "id": "diag-1",\n  "type": "diagram",\n  "chart": "graph TD\\n  A[Cliente HTTP] --> B[API Gateway]\\n  B --> C[Cloudflare D1]" \n}`,
    },
    {
      type: 'math',
      title: 'Fórmulas Matemáticas LaTeX',
      description: 'Renderiza notación matemática formal, integrales y complejidad algorítmica KaTeX.',
      icon: <Sigma className="w-5 h-5 text-emerald-500" />,
      snippet: `{\n  "id": "math-1",\n  "type": "math",\n  "formula": "O(n \\\\log n) = \\\\sum_{i=1}^n \\\\log i"\n}`,
    },
    {
      type: 'tabs',
      title: 'Pestañas de Código / Soluciones',
      description: 'Muestra múltiples lenguajes o código vs salida por consola en pestañas Notion.',
      icon: <Layers className="w-5 h-5 text-blue-500" />,
      snippet: `{\n  "id": "tabs-1",\n  "type": "tabs",\n  "tabs": [\n    { "title": "Java", "language": "java", "content": "System.out.println(\\"Hola\\");" },\n    { "title": "Python", "language": "python", "content": "print('Hola')" }\n  ]\n}`,
    },
    {
      type: 'quiz',
      title: 'Cuestionarios Evaluativos (Quiz)',
      description: 'Evaluaciones completas con puntaje, temporizador y porcentaje de aprobación.',
      icon: <ListOrdered className="w-5 h-5 text-purple-500" />,
      snippet: `{\n  "id": "quiz-1",\n  "type": "quiz",\n  "passingScore": 80,\n  "questions": [\n    {\n      "question": "¿Cuál es la complejidad temporal de Binary Search?",\n      "options": [\n        { "id": "q1", "text": "O(log n)", "isCorrect": true },\n        { "id": "q2", "text": "O(n^2)", "isCorrect": false }\n      ]\n    }\n  ]\n}`,
    },
    {
      type: 'table',
      title: 'Tablas Comparativas',
      description: 'Estructura comparativas técnicas con N filas y columnas de Markdown.',
      icon: <Table className="w-5 h-5 text-amber-500" />,
      snippet: `{\n  "id": "tbl-1",\n  "type": "table",\n  "headers": ["Característica", "ArrayList", "LinkedList"],\n  "rows": [\n    ["Acceso por índice", "O(1)", "O(n)"],\n    ["Inserción al inicio", "O(n)", "O(1)"]\n  ]\n}`,
    },
    {
      type: 'code',
      title: 'Bloques de Código Fuente',
      description: 'Resaltado de sintaxis con botón de copiado rápido para decenas de lenguajes.',
      icon: <Code2 className="w-5 h-5 text-cyan-500" />,
      snippet: `{\n  "id": "code-1",\n  "type": "code",\n  "language": "typescript",\n  "code": "export const greeting = (name: string): string => \`Hola, \${name}\`;"\n}`,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/creator')}
            className="text-xs font-semibold text-[#0066CC] dark:text-[#4D94FF] hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Panel Creador
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] dark:text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            Centro de Guías & Normas para Creadores
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-[#A0A0A0] mt-1">
            Todo lo que necesitas saber para crear contenido interactivo de nivel profesional en StudyPlatform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/upload')}
            leftIcon={<FileCode className="w-4 h-4 text-[#0066CC]" />}
          >
            Subir JSON
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/creator')}
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Mis Cursos
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E0E0E0] dark:border-[#2D2D2D] overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Normas de Publicación</span>
        </button>

        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'workflow'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Flujo de Creación & Whitelist</span>
        </button>

        <button
          onClick={() => setActiveTab('blocks')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'blocks'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Catálogo de Bloques Interactivos</span>
        </button>

        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'prompts'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Plantillas de Prompts IA</span>
        </button>
      </div>

      {/* Tab 1: Rules & Policies */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <Card className="p-6 border-l-4 border-l-purple-600">
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-2">
              📜 Normas Oficiales de Publicación en Marketplace
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Para garantizar que los estudiantes disfruten de una experiencia de aprendizaje de primer nivel, todos los cursos deben respetar las siguientes directrices antes de ser aprobados en la Whitelist:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-[#1A1A1A] dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>1. Calidad y Claridad Pedagógica</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Las lecciones deben tener explicaciones progresivas, sin saltos abruptos. Se recomienda combinar texto, diagramas conceptuales y código funcional.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-[#1A1A1A] dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>2. Originalidad y Autoría</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  El contenido debe ser de tu propia autoría o tener derechos de distribución. Está estrictamente prohibido el plagio de contenido comercial.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-[#1A1A1A] dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>3. Código Seguro y Libre de Amenazas</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  No se permite la inclusión de código malicioso, scripts ofuscados o enlaces a software no verificado.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-[#1A1A1A] dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>4. Interactividad Requerida</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Cada lección debe contener al menos un elemento interactivo (pregunta de opción múltiple, quiz o ejercicio de código).
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Creation Workflow & Whitelist */}
      {activeTab === 'workflow' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-4">
              🚀 Ciclo de Vida de un Curso en StudyPlatform
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#1A1A1A] dark:text-white">
                    Creación en Borrador (Privado)
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Crea el curso desde tu Panel Creador o sube una carpeta con archivos JSON en el importador. El curso permanecerá privado y solo visible para ti.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0066CC] text-white font-black text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#1A1A1A] dark:text-white">
                    Edición Interactiva y Copiloto IA
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Añade módulos y lecciones interactivas. Puedes usar el Copiloto de IA para ayudarte a redactar contenido o generar diagramas técnicos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#1A1A1A] dark:text-white">
                    Envío a Whitelist & Comparador Diff
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Al presionar "Solicitar Publicación", se genera una instantánea completa para que el Administrador revise los cambios con el visor de diferencias.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#1A1A1A] dark:text-white">
                    Publicación Automática en Marketplace
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Una vez aprobado, el curso se publica instantáneamente en el Marketplace público y los estudiantes pueden comenzar a inscribirse.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Interactive Blocks Catalog */}
      {activeTab === 'blocks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blockExamples.map((block) => (
            <Card key={block.type} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-gray-100 dark:bg-[#202020]">
                      {block.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-[#1A1A1A] dark:text-white">
                        {block.title}
                      </h3>
                      <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                        type: "{block.type}"
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mb-3">
                  {block.description}
                </p>
              </div>

              <div className="relative rounded-xl bg-gray-900 text-gray-200 p-3 font-mono text-[11px] overflow-x-auto">
                <button
                  onClick={() => handleCopy(block.snippet, block.type)}
                  className="absolute top-2 right-2 p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
                  title="Copiar snippet"
                >
                  {copiedId === block.type ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
                <pre>{block.snippet}</pre>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 4: Real Master Prompts */}
      {activeTab === 'prompts' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-purple-950 dark:text-purple-200">
                Biblioteca Oficial de Prompts Maestros de IA para Creadores
              </h4>
              <p className="text-purple-800 dark:text-purple-300 leading-relaxed">
                Estos son los mismos prompts maestros utilizados para crear los cursos de referencia de la plataforma. Cuentan con el catálogo estricto de los 18 bloques visuales, esquemas Zod y soporte para carpetas modulares. Cópialos o descárgalos para usarlos en ChatGPT, Claude o Gemini.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {REAL_MASTER_PROMPTS.map((template) => {
              const isExpanded = expandedPromptId === template.id;

              return (
                <Card key={template.id} className="p-5 overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-white">
                          {template.title}
                        </h3>
                        <Badge variant="primary" size="sm">
                          {template.tag}
                        </Badge>
                        <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                          {template.filename}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {template.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(template.filename, template.content)}
                        leftIcon={<Download className="w-3.5 h-3.5 text-blue-600" />}
                        title="Descargar archivo markdown para tu IA"
                      >
                        Descargar .md
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCopy(template.content, template.id)}
                        leftIcon={
                          copiedId === template.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )
                        }
                      >
                        {copiedId === template.id ? '¡Copiado!' : 'Copiar Prompt'}
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => setExpandedPromptId(isExpanded ? null : template.id)}
                      className="text-xs font-semibold text-[#0066CC] dark:text-[#4D94FF] hover:underline flex items-center gap-1.5 py-1"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <span>{isExpanded ? 'Ocultar vista previa del prompt' : 'Ver contenido completo del prompt'}</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-3 relative rounded-2xl bg-gray-900 text-gray-200 p-4 font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
                        <button
                          onClick={() => handleCopy(template.content, template.id)}
                          className="sticky top-0 float-right px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition text-[11px] flex items-center gap-1.5 z-10 border border-gray-700"
                        >
                          {copiedId === template.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                        <pre className="whitespace-pre-wrap leading-relaxed">{template.content}</pre>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
