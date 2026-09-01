import React, { useState, useEffect } from 'react';
import { Block, BlockType, ChoiceOption } from '../../../types';
import { Modal } from '../../shared/Modal';
import { Button } from '../../shared/Button';
import { Input } from '../../shared/Input';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface BlockEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: Block | null;
  onSave: (updatedBlock: Block) => void;
}

export const BlockEditModal: React.FC<BlockEditModalProps> = ({
  isOpen,
  onClose,
  block,
  onSave,
}) => {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (block) {
      setFormData(JSON.parse(JSON.stringify(block)));
    }
  }, [block]);

  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const renderFields = () => {
    switch (formData.type as BlockType) {
      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
                Nivel de Encabezado (H1 a H6)
              </label>
              <select
                value={formData.level || 1}
                onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                className="w-full h-11 px-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-sm text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC] dark:focus:border-[#4D94FF]"
              >
                <option value={1}>H1 - Título Principal</option>
                <option value={2}>H2 - Sección</option>
                <option value={3}>H3 - Subsección</option>
                <option value={4}>H4 - Detalle</option>
              </select>
            </div>
            <Input
              label="Texto del Encabezado"
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Ej. Introducción a Variables en Java"
              required
            />
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white">
              Contenido del Párrafo
            </label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Escribe el texto explicativo de la lección..."
              rows={6}
              className="w-full p-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-sm text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC] dark:focus:border-[#4D94FF]"
              required
            />
          </div>
        );

      case 'code':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Lenguaje de Programación"
                value={formData.language || 'java'}
                onChange={(e) => setFormData({ ...formData, language: e.target.value.toLowerCase() })}
                placeholder="java, python, javascript, sql..."
                required
              />
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="copyable_check"
                  checked={formData.copyable !== false}
                  onChange={(e) => setFormData({ ...formData, copyable: e.target.checked })}
                  className="w-4 h-4 text-[#0066CC] rounded"
                />
                <label htmlFor="copyable_check" className="text-xs font-semibold text-[#1A1A1A] dark:text-white cursor-pointer">
                  Permitir botón de copiar código
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
                Fragmento de Código
              </label>
              <textarea
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="int puntuacion = 100;\nSystem.out.println(puntuacion);"
                rows={7}
                className="w-full p-3 font-mono bg-gray-50 dark:bg-[#111111] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#0066CC] dark:focus:border-[#4D94FF]"
                required
              />
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <Input
              label="URL de la Imagen"
              value={formData.url || ''}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://ejemplo.com/imagen.png"
              required
            />
            <Input
              label="Texto Alternativo (Alt)"
              value={formData.alt || ''}
              onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
              placeholder="Descripción para accesibilidad"
              required
            />
            <Input
              label="Pie de Foto (Opcional)"
              value={formData.caption || ''}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Figura 1: Representación de memoria"
            />
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <Input
              label="URL del Video (YouTube, Vimeo o MP4)"
              value={formData.url || ''}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            <Input
              label="Título del Video"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Explicación en Video"
              required
            />
            <Input
              label="Duración Estimada (Opcional)"
              value={formData.duration || ''}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="Ej. 5:30"
            />
          </div>
        );

      case 'question_choice':
        const options: ChoiceOption[] = formData.options || [];

        const updateOption = (idx: number, updates: Partial<ChoiceOption>) => {
          const newOpts = [...options];
          newOpts[idx] = { ...newOpts[idx], ...updates };
          setFormData({ ...formData, options: newOpts });
        };

        const addOption = () => {
          setFormData({
            ...formData,
            options: [
              ...options,
              { id: `opt_${Date.now()}`, text: '', isCorrect: options.length === 0 },
            ],
          });
        };

        const removeOption = (idx: number) => {
          setFormData({
            ...formData,
            options: options.filter((_, i) => i !== idx),
          });
        };

        return (
          <div className="space-y-4">
            <Input
              label="Pregunta"
              value={formData.question || ''}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="¿Cuál es la salida del código anterior?"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#1A1A1A] dark:text-white">
                  Opciones de Respuesta (Marca la correcta)
                </label>
                <Button type="button" variant="outline" size="sm" onClick={addOption} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Añadir Opción
                </Button>
              </div>

              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={opt.id || idx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newOpts = options.map((o, i) => ({
                          ...o,
                          isCorrect: i === idx,
                        }));
                        setFormData({ ...formData, options: newOpts });
                      }}
                      className={`p-2 rounded-lg border transition ${
                        opt.isCorrect
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-700'
                      }`}
                      title="Marcar como correcta"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOption(idx, { text: e.target.value })}
                      placeholder={`Opción ${idx + 1}`}
                      className="flex-1 h-10 px-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
                      required
                    />
                    <button
                      type="button"
                      disabled={options.length <= 2}
                      onClick={() => removeOption(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
                Explicación de la Respuesta
              </label>
              <textarea
                value={formData.explanation || ''}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Explica detalladamente por qué la opción marcada es la correcta..."
                rows={3}
                className="w-full p-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
                required
              />
            </div>
          </div>
        );

      case 'question_free':
        return (
          <div className="space-y-4">
            <Input
              label="Pregunta / Enunciado del Reto"
              value={formData.question || ''}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Escribe el comando para declarar una variable de tipo entero..."
              required
            />
            <Input
              label="Respuesta Esperada"
              value={formData.expectedAnswer || ''}
              onChange={(e) => setFormData({ ...formData, expectedAnswer: e.target.value })}
              placeholder="int x = 10;"
              required
            />
            <Input
              label="Pista Opcional (Hint)"
              value={formData.hint || ''}
              onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
              placeholder="Recuerda usar el tipo de dato primitivo antes del nombre"
            />
          </div>
        );

      case 'info':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
                Tipo de Alerta
              </label>
              <select
                value={formData.level || 'info'}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full h-11 px-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-sm text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
              >
                <option value="info">Información (Azul)</option>
                <option value="success">Consejo / Éxito (Verde)</option>
                <option value="warning">Advertencia (Amarillo)</option>
                <option value="error">Error Común (Rojo)</option>
              </select>
            </div>
            <Input
              label="Título de la Nota (Opcional)"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="¡Atención!"
            />
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
                Mensaje
              </label>
              <textarea
                value={formData.message || ''}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Escribe el mensaje de la nota..."
                rows={3}
                className="w-full p-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
                required
              />
            </div>
          </div>
        );

      case 'database_modeler':
        return (
          <div className="space-y-4">
            <Input
              label="Título del Ejercicio de Modelado"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej. Modelado ER: Sistema de Ventas"
              required
            />
            <Input
              label="Instrucciones Breves"
              value={formData.instructions || ''}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Diseña las entidades y relaciones..."
              required
            />
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
                Enunciado del Problema (Escenario)
              </label>
              <textarea
                value={formData.scenario || ''}
                onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                placeholder="Describe la lógica del negocio y requerimientos..."
                rows={4}
                className="w-full p-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
              />
            </div>
            <Input
              label="Pista Opcional (Hint)"
              value={formData.hint || ''}
              onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
              placeholder="Pista sobre claves foráneas o tablas intermedias"
            />
          </div>
        );

      default:
        return (
          <p className="text-xs text-gray-500">
            Edición visual directa para el tipo <span className="font-mono">{formData.type}</span> en desarrollo.
          </p>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Bloque: ${formData.type.toUpperCase()}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {renderFields()}

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E0E0] dark:border-[#2D2D2D]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar Bloque
          </Button>
        </div>
      </form>
    </Modal>
  );
};
