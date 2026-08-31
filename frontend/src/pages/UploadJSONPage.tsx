import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCourseStore } from '../stores/courseStore';
import { Card } from '../components/shared/Card';
import { JSONUploader } from '../components/admin/JSONUploader';

export const UploadJSONPage: React.FC = () => {
  const { courses, fetchCourses } = useCourseStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSuccess = (lessonData: any) => {
    if (lessonData?.id) {
      setTimeout(() => {
        navigate(`/lessons/${lessonData.id}`);
      }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#666666] hover:text-[#1A1A1A] dark:text-[#B0B0B0] dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al Panel de Administración</span>
      </button>

      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#0066CC] dark:text-[#4D94FF]">
          Generador de Lecciones
        </span>
        <h1 className="text-3xl font-extrabold text-[#1A1A1A] dark:text-white tracking-tight mt-0.5">
          Importar Lección desde JSON
        </h1>
        <p className="text-sm text-[#666666] dark:text-[#B0B0B0] mt-1 leading-relaxed">
          Carga un archivo o pega el JSON con los 9 tipos de bloques admitidos. Nuestro motor validará automáticamente el esquema con Zod y creará la lección interactiva al instante.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <JSONUploader courses={courses} onUploadSuccess={handleSuccess} />
      </Card>
    </div>
  );
};
