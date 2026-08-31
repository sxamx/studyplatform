import React, { useState } from 'react';
import { Upload, FileCode, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { apiFetch } from '../../api/client';
import { Button } from '../shared/Button';
import { Course } from '../../types';

interface JSONUploaderProps {
  courses: Course[];
  onUploadSuccess?: (lessonData: any) => void;
}

export const JSONUploader: React.FC<JSONUploaderProps> = ({ courses, onUploadSuccess }) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [jsonText, setJsonText] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<Array<{ path: string; message: string }> | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setError(null);
      setErrorDetails(null);

      const reader = new FileReader();
      reader.onload = (evt) => {
        setJsonText(evt.target?.result as string);
      };
      reader.readAsText(selected);
    }
  };

  const handleUpload = async () => {
    if (!jsonText.trim() && !file) {
      setError('Por favor sube un archivo JSON o pega el contenido JSON.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setErrorDetails(null);
    setSuccessData(null);

    try {
      let parsedJson: any;
      try {
        parsedJson = JSON.parse(jsonText);
      } catch (err: any) {
        setError(`Error de sintaxis JSON: ${err.message}`);
        setIsUploading(false);
        return;
      }

      const res = await apiFetch('/upload/json', {
        method: 'POST',
        body: JSON.stringify({
          courseId: selectedCourseId || undefined,
          jsonContent: parsedJson,
        }),
      });

      setSuccessData(res);
      setJsonText('');
      setFile(null);
      if (onUploadSuccess) {
        onUploadSuccess(res);
      }
    } catch (err: any) {
      setError(err.message || 'Error al validar y guardar el JSON');
      if (err.details) {
        setErrorDetails(err.details);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const sampleJson = {
    version: '1.0',
    lesson: {
      id: 'mi_nueva_leccion_01',
      title: 'Ejemplo de Lección Interactiva',
      description: 'Lección generada con Zod y componentes interactivos',
      order: 1,
      estimatedMinutes: 10,
      blocks: [
        {
          type: 'heading',
          id: 'h1',
          level: 1,
          content: '¡Bienvenido a la lección!',
        },
        {
          type: 'text',
          id: 't1',
          content: 'Esta es una lección cargada directamente desde un archivo JSON validado.',
        },
        {
          type: 'question_choice',
          id: 'q1',
          question: '¿Qué método de Node.js v24 usamos para SQLite nativo?',
          options: [
            { id: 'opt_1', text: 'node:sqlite (DatabaseSync)', isCorrect: true },
            { id: 'opt_2', text: 'node:mysql', isCorrect: false },
            { id: 'opt_3', text: 'node:mongo', isCorrect: false },
          ],
          explanation: 'Node.js v24 incluye node:sqlite de forma nativa sin necesidad de compiladores nativos.',
        },
      ],
    },
  };

  const loadSample = () => {
    setJsonText(JSON.stringify(sampleJson, null, 2));
    setError(null);
    setErrorDetails(null);
  };

  return (
    <div className="space-y-6">
      {/* Course Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-[#B0B0B0]">
          Asignar a Curso (Opcional)
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full h-11 px-4 text-sm bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg outline-none focus:border-[#0066CC] dark:focus:border-[#4D94FF]"
        >
          <option value="">-- Crear/Usar Curso General Automático --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Drag and Drop Zone */}
      <div className="border-2 border-dashed border-[#E0E0E0] dark:border-[#2D2D2D] hover:border-[#0066CC] dark:hover:border-[#4D94FF] rounded-2xl p-8 text-center transition-colors bg-[#F5F5F5]/50 dark:bg-[#1A1A1A]/50">
        <input
          type="file"
          id="json-file-input"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="json-file-input" className="cursor-pointer flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0066CC]/10 dark:bg-[#4D94FF]/20 text-[#0066CC] dark:text-[#4D94FF] flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A1A1A] dark:text-white">
              {file ? file.name : 'Haz clic para seleccionar o arrastra tu archivo JSON'}
            </p>
            <p className="text-xs text-[#666666] dark:text-[#808080] mt-1">
              Esquema de lección conforme a la especificación v1.0
            </p>
          </div>
        </label>
      </div>

      {/* Raw JSON Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-[#B0B0B0] flex items-center gap-1.5">
            <FileCode className="w-4 h-4" />
            <span>Editor JSON en Vivo</span>
          </label>
          <button
            type="button"
            onClick={loadSample}
            className="text-xs font-medium text-[#0066CC] dark:text-[#4D94FF] hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Cargar Plantilla de Ejemplo
          </button>
        </div>

        <textarea
          rows={12}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Pega o edita el JSON de la lección aquí..."
          className="w-full p-4 font-mono text-xs leading-relaxed bg-[#F5F5F5] dark:bg-[#0F0F0F] text-[#1A1A1A] dark:text-[#E0E0E0] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl outline-none focus:border-[#0066CC] dark:focus:border-[#4D94FF] resize-y"
        />
      </div>

      {/* Error Message & Breakdown */}
      {error && (
        <div className="p-4 rounded-xl border border-[#DC3545]/30 bg-[#DC3545]/10 text-[#DC3545] dark:text-[#FF6B6B] space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          {errorDetails && errorDetails.length > 0 && (
            <ul className="list-disc list-inside text-xs space-y-1 pl-6">
              {errorDetails.map((detail, idx) => (
                <li key={idx}>
                  <strong className="font-mono">{detail.path}</strong>: {detail.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Success Notification */}
      {successData && (
        <div className="p-4 rounded-xl border border-[#10A950]/30 bg-[#10A950]/10 text-[#10A950] dark:text-[#2ECC71] flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-bold">¡Lección validada e importada con éxito!</h5>
            <p className="text-xs mt-1 text-[#1A1A1A] dark:text-[#E0E0E0]">
              Lección: <strong>{successData.title}</strong> con{' '}
              <strong>{successData.blocksCount}</strong> bloques interactivos.
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          size="lg"
          isLoading={isUploading}
          onClick={handleUpload}
          rightIcon={<Upload className="w-4 h-4" />}
        >
          Validar e Importar Lección
        </Button>
      </div>
    </div>
  );
};
