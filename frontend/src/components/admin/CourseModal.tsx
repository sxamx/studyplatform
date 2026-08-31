import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { Course } from '../../types';
import { apiFetch } from '../../api/client';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit?: Course | null;
  onSaved: () => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  courseToEdit,
  onSaved,
}) => {
  const [title, setTitle] = useState(courseToEdit?.title || '');
  const [description, setDescription] = useState(courseToEdit?.description || '');
  const [isPublished, setIsPublished] = useState(courseToEdit?.isPublished ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync state if editing
  React.useEffect(() => {
    if (courseToEdit) {
      setTitle(courseToEdit.title);
      setDescription(courseToEdit.description || '');
      setIsPublished(courseToEdit.isPublished);
    } else {
      setTitle('');
      setDescription('');
      setIsPublished(true);
    }
    setError('');
  }, [courseToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título del curso es requerido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (courseToEdit) {
        await apiFetch(`/courses/${courseToEdit.id}`, {
          method: 'PUT',
          body: JSON.stringify({ title, description, isPublished }),
        });
      } else {
        await apiFetch('/courses', {
          method: 'POST',
          body: JSON.stringify({ title, description, isPublished }),
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el curso');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={courseToEdit ? 'Editar Curso' : 'Crear Nuevo Curso'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Título del Curso"
          placeholder="Ej: Java Avanzado y Spring Boot"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-[#B0B0B0]">
            Descripción
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción del contenido y objetivos del curso..."
            className="w-full p-3 text-sm bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg outline-none focus:border-[#0066CC] dark:focus:border-[#4D94FF]"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="publish-check"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 text-[#0066CC] rounded border-[#E0E0E0] focus:ring-[#0066CC]"
          />
          <label htmlFor="publish-check" className="text-sm font-medium text-[#1A1A1A] dark:text-white cursor-pointer">
            Publicar curso para estudiantes
          </label>
        </div>

        {error && <p className="text-xs text-[#DC3545] font-medium">{error}</p>}

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E0E0] dark:border-[#2D2D2D]">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {courseToEdit ? 'Guardar Cambios' : 'Crear Curso'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
