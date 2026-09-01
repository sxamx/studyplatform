import React, { useState, useRef } from 'react';
import {
  Save,
  Eye,
  Code2,
  LayoutGrid,
  Plus,
  Check,
  Sparkles,
} from 'lucide-react';
import { Block, BlockType, LessonJSON } from '../../../types';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import { BlockCard } from './BlockCard';
import { BlockEditModal } from './BlockEditModal';
import { BlockRenderer } from '../../lesson/BlockRenderer';

interface VisualLessonEditorProps {
  initialLessonJson: LessonJSON;
  onSave: (json: LessonJSON) => Promise<void>;
  lessonTitle?: string;
}

export const VisualLessonEditor: React.FC<VisualLessonEditorProps> = ({
  initialLessonJson,
  onSave,
  lessonTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'preview'>('visual');
  const [lessonData, setLessonData] = useState<LessonJSON>(initialLessonJson);
  const [rawJsonText, setRawJsonText] = useState<string>(JSON.stringify(initialLessonJson, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<any>(null);

  // Sync JSON text when lessonData changes from visual editor
  const updateLessonState = (newLesson: LessonJSON, triggerAutoSave = true) => {
    setLessonData(newLesson);
    setRawJsonText(JSON.stringify(newLesson, null, 2));
    setJsonError(null);

    if (triggerAutoSave) {
      setSaveStatus('saving');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await onSave(newLesson);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2500);
        } catch {
          setSaveStatus('idle');
        }
      }, 3000);
    }
  };

  const handleRawJsonChange = (text: string) => {
    setRawJsonText(text);
    try {
      const parsed = JSON.parse(text);
      if (parsed.lesson && Array.isArray(parsed.lesson.blocks)) {
        setLessonData(parsed);
        setJsonError(null);
      } else {
        setJsonError('El JSON debe contener un objeto "lesson" con un array "blocks"');
      }
    } catch (e: any) {
      setJsonError(e.message || 'JSON inválido');
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const blocks = [...lessonData.lesson.blocks];
    const temp = blocks[index - 1];
    blocks[index - 1] = blocks[index];
    blocks[index] = temp;

    updateLessonState({
      ...lessonData,
      lesson: { ...lessonData.lesson, blocks },
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= lessonData.lesson.blocks.length - 1) return;
    const blocks = [...lessonData.lesson.blocks];
    const temp = blocks[index + 1];
    blocks[index + 1] = blocks[index];
    blocks[index] = temp;

    updateLessonState({
      ...lessonData,
      lesson: { ...lessonData.lesson, blocks },
    });
  };

  const handleDeleteBlock = (index: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este bloque?')) return;
    const blocks = lessonData.lesson.blocks.filter((_, i) => i !== index);
    updateLessonState({
      ...lessonData,
      lesson: { ...lessonData.lesson, blocks },
    });
  };

  const handleEditBlock = (block: Block, index: number) => {
    setEditingBlock(block);
    setEditingBlockIndex(index);
  };

  const handleSaveEditedBlock = (updatedBlock: Block) => {
    if (editingBlockIndex === null) return;
    const blocks = [...lessonData.lesson.blocks];
    blocks[editingBlockIndex] = updatedBlock;

    updateLessonState({
      ...lessonData,
      lesson: { ...lessonData.lesson, blocks },
    });
  };

  const handleAddBlock = (type: BlockType) => {
    setIsAddMenuOpen(false);
    const id = `block_${type}_${Date.now()}`;
    let newBlock: Block;

    switch (type) {
      case 'heading':
        newBlock = { type: 'heading', id, level: 2, content: 'Nuevo Título de Sección' };
        break;
      case 'text':
        newBlock = { type: 'text', id, content: 'Escribe aquí la explicación teórica o instrucción del concepto...' };
        break;
      case 'code':
        newBlock = { type: 'code', id, language: 'java', code: '// Tu código aquí\nint x = 42;', copyable: true };
        break;
      case 'image':
        newBlock = { type: 'image', id, url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600', alt: 'Diagrama explicativo', caption: 'Figura: Vista general' };
        break;
      case 'video':
        newBlock = { type: 'video', id, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Video Explicativo', duration: '5:00' };
        break;
      case 'question_choice':
        newBlock = {
          type: 'question_choice',
          id,
          question: '¿Cuál es el resultado de la operación?',
          options: [
            { id: 'opt_1', text: 'Opción Correcta', isCorrect: true },
            { id: 'opt_2', text: 'Opción Incorrecta', isCorrect: false },
          ],
          explanation: 'Esta es la explicación detallada de por qué la opción 1 es la correcta.',
        };
        break;
      case 'question_free':
        newBlock = {
          type: 'question_free',
          id,
          question: 'Escribe el código para imprimir un mensaje en consola:',
          expectedAnswer: 'System.out.println("Hola");',
          hint: 'Utiliza el método println de System.out',
        };
        break;
      case 'quiz':
        newBlock = {
          type: 'quiz',
          id,
          title: 'Mini Cuestionario de Repaso',
          questions: [
            {
              id: 'q_1',
              type: 'choice',
              question: '¿Qué es una variable?',
              options: [
                { id: 'q1_o1', text: 'Un espacio en memoria para almacenar un valor', isCorrect: true },
                { id: 'q1_o2', text: 'Un bucle infinito', isCorrect: false },
              ],
            },
          ],
        };
        break;
      case 'info':
        newBlock = {
          type: 'info',
          id,
          level: 'info',
          title: 'Consejo Profesional',
          message: 'Recuerda siempre indentar tu código correctamente para mejorar su legibilidad.',
        };
        break;
      case 'database_modeler':
        newBlock = {
          type: 'database_modeler',
          id,
          title: 'Ejercicio de Modelado ER',
          instructions: 'Diseña el diagrama Entidad-Relación agregando las entidades y atributos requeridos.',
          scenario: 'Crea las tablas y relaciones necesarias para el sistema.',
          initialEntities: [
            {
              id: `ent_${Date.now()}_1`,
              name: 'Usuario',
              position: { x: 50, y: 60 },
              attributes: [{ name: 'usuario_id', type: 'INTEGER', isPk: true }],
            },
          ],
        };
        break;
    }

    const blocks = [...lessonData.lesson.blocks, newBlock];
    updateLessonState({
      ...lessonData,
      lesson: { ...lessonData.lesson, blocks },
    });
  };

  const handleManualSave = async () => {
    setSaveStatus('saving');
    try {
      await onSave(lessonData);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('idle');
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0066CC] dark:text-[#4D94FF]">
              Editor de Lección
            </span>
            {saveStatus === 'saving' && (
              <Badge variant="secondary" size="sm">
                Guardando auto...
              </Badge>
            )}
            {saveStatus === 'saved' && (
              <Badge variant="success" size="sm">
                <Check className="w-3 h-3 mr-1 inline" /> Guardado
              </Badge>
            )}
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white truncate max-w-md">
            {lessonTitle || lessonData.lesson?.title || 'Lección sin título'}
          </h2>
        </div>

        {/* Tabs and Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-gray-100 dark:bg-[#1F1F1F] rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D]">
            <button
              type="button"
              onClick={() => setActiveTab('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'visual'
                  ? 'bg-white dark:bg-[#141414] text-[#0066CC] dark:text-[#4D94FF] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Editor Visual
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'json'
                  ? 'bg-white dark:bg-[#141414] text-[#0066CC] dark:text-[#4D94FF] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              JSON Crudo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-[#141414] text-[#0066CC] dark:text-[#4D94FF] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Previsualizar
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleManualSave}
            isLoading={saveStatus === 'saving'}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Guardar
          </Button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'visual' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">
              Total de bloques interactivos: {lessonData.lesson?.blocks?.length || 0}
            </p>

            {/* Add Block Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Insertar Bloque
              </Button>

              {isAddMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl shadow-xl z-30 py-2 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Contenido y Medios
                  </div>
                  <button
                    onClick={() => handleAddBlock('heading')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-[#1A1A1A] dark:text-white"
                  >
                    <span>📌</span> Encabezado (H1-H6)
                  </button>
                  <button
                    onClick={() => handleAddBlock('text')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-[#1A1A1A] dark:text-white"
                  >
                    <span>📄</span> Párrafo de Texto
                  </button>
                  <button
                    onClick={() => handleAddBlock('code')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-[#1A1A1A] dark:text-white"
                  >
                    <span>💻</span> Bloque de Código
                  </button>
                  <button
                    onClick={() => handleAddBlock('image')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-[#1A1A1A] dark:text-white"
                  >
                    <span>🖼️</span> Imagen
                  </button>
                  <button
                    onClick={() => handleAddBlock('video')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-[#1A1A1A] dark:text-white"
                  >
                    <span>🎥</span> Video Embebido
                  </button>
                  <button
                    onClick={() => handleAddBlock('info')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-[#1A1A1A] dark:text-white"
                  >
                    <span>💡</span> Nota / Alerta
                  </button>

                  <div className="my-1 border-t border-[#E0E0E0] dark:border-[#2D2D2D]" />
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Interactividad y Preguntas
                  </div>
                  <button
                    onClick={() => handleAddBlock('question_choice')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-[#1A1A1A] dark:text-white"
                  >
                    <span>❓</span> Selección Múltiple
                  </button>
                  <button
                    onClick={() => handleAddBlock('question_free')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-[#1A1A1A] dark:text-white"
                  >
                    <span>✍️</span> Pregunta Libre / Código
                  </button>
                  <button
                    onClick={() => handleAddBlock('quiz')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-[#1A1A1A] dark:text-white"
                  >
                    <span>📝</span> Cuestionario (Quiz)
                  </button>
                  <button
                    onClick={() => handleAddBlock('database_modeler')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-[#1A1A1A] dark:text-white"
                  >
                    <span>🗄️</span> Lienzo ER (Data Modeler)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Block Cards List */}
          <div className="space-y-3">
            {lessonData.lesson?.blocks?.map((block, index) => (
              <BlockCard
                key={block.id || index}
                block={block}
                index={index}
                totalBlocks={lessonData.lesson.blocks.length}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onEdit={handleEditBlock}
                onDelete={handleDeleteBlock}
              />
            ))}

            {(!lessonData.lesson?.blocks || lessonData.lesson.blocks.length === 0) && (
              <div className="text-center py-12 border-2 border-dashed border-[#E0E0E0] dark:border-[#2D2D2D] rounded-2xl">
                <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">Esta lección aún no tiene bloques</p>
                <p className="text-xs text-gray-500 mb-4">Haz clic en "Insertar Bloque" para comenzar a agregar contenido interactivo.</p>
                <Button variant="outline" size="sm" onClick={() => handleAddBlock('heading')}>
                  Añadir Primer Bloque
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'json' && (
        <div className="space-y-3">
          {jsonError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
              ⚠️ Error de sintaxis JSON: {jsonError}
            </div>
          )}
          <textarea
            value={rawJsonText}
            onChange={(e) => handleRawJsonChange(e.target.value)}
            rows={22}
            className="w-full p-4 font-mono text-xs bg-[#111111] text-emerald-400 border border-[#2D2D2D] rounded-2xl focus:outline-none focus:border-[#0066CC]"
          />
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="p-8 bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-2xl max-w-3xl mx-auto space-y-6">
          <div className="border-b border-[#E0E0E0] dark:border-[#2D2D2D] pb-4">
            <span className="text-xs font-bold uppercase text-[#0066CC] dark:text-[#4D94FF]">Vista Previa del Alumno</span>
            <h1 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-white">{lessonData.lesson?.title}</h1>
            {lessonData.lesson?.description && (
              <p className="text-xs text-[#666666] dark:text-[#B0B0B0] mt-1">{lessonData.lesson.description}</p>
            )}
          </div>

          <div className="space-y-6">
            {lessonData.lesson?.blocks?.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingBlock && (
        <BlockEditModal
          isOpen={Boolean(editingBlock)}
          onClose={() => {
            setEditingBlock(null);
            setEditingBlockIndex(null);
          }}
          block={editingBlock}
          onSave={handleSaveEditedBlock}
        />
      )}
    </div>
  );
};
