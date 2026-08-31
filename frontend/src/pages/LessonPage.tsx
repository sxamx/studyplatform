import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseStore } from '../stores/courseStore';
import { LessonViewer } from '../components/lesson/LessonViewer';
import { Button } from '../components/shared/Button';

export const LessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeLesson, fetchLessonById, isLoading } = useCourseStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchLessonById(id);
      window.scrollTo(0, 0);
    }
  }, [id, fetchLessonById]);

  if (isLoading || !activeLesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 border-3 border-[#0066CC] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#666666] dark:text-[#B0B0B0]">Cargando lección interactiva...</p>
      </div>
    );
  }

  if (!activeLesson.content) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white">Lección sin contenido</h3>
        <p className="text-xs text-[#666666] dark:text-[#B0B0B0]">
          Esta lección aún no cuenta con bloques JSON definidos.
        </p>
        <Button variant="primary" onClick={() => navigate(`/courses/${activeLesson.courseId}`)}>
          Volver al curso
        </Button>
      </div>
    );
  }

  return <LessonViewer lesson={activeLesson} />;
};
