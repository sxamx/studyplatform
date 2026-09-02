import React, { useState, useRef } from 'react';
import { Upload, FileCode, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { apiFetch } from '../../api/client';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { Course } from '../../types';

interface JSONUploaderProps {
  courses: Course[];
  onUploadSuccess?: (lessonData: any) => void;
}

export const JSONUploader: React.FC<JSONUploaderProps> = ({ courses, onUploadSuccess }) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [jsonText, setJsonText] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<Array<{ path: string; message: string }> | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadedFilesInfo, setLoadedFilesInfo] = useState<{ name: string; type: string }[]>([]);

  const getFilesFromDataTransfer = async (dataTransfer: DataTransfer): Promise<File[]> => {
    const files: File[] = [];
    const items = dataTransfer.items;

    if (items && items.length > 0) {
      const traverseEntry = async (entry: any): Promise<void> => {
        if (!entry) return;
        if (entry.isFile) {
          await new Promise<void>((resolve) => {
            entry.file(
              (file: File) => {
                if (file.name.toLowerCase().endsWith('.json') || file.type.includes('json')) {
                  files.push(file);
                }
                resolve();
              },
              () => resolve()
            );
          });
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader();
          const readEntries = async (): Promise<any[]> => {
            return new Promise((resolve) => {
              dirReader.readEntries((entries: any[]) => resolve(entries || []), () => resolve([]));
            });
          };
          let batch = await readEntries();
          while (batch.length > 0) {
            for (const child of batch) {
              await traverseEntry(child);
            }
            batch = await readEntries();
          }
        }
      };

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (typeof item.webkitGetAsEntry === 'function') {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            await traverseEntry(entry);
          }
        }
      }
    }

    if (files.length === 0 && dataTransfer.files) {
      return Array.from(dataTransfer.files).filter(
        (f) => f.name.toLowerCase().endsWith('.json') || f.type.includes('json') || f.type === ''
      );
    }
    return files;
  };

  // Process single or multiple JSON files (from picker or drag & drop)
  const processJsonFiles = async (filesList: File[]) => {
    setError(null);
    setErrorDetails(null);
    setSuccessData(null);

    const jsonFiles = filesList.filter(
      (f) => f.name.toLowerCase().endsWith('.json') || f.type.includes('json') || f.type === ''
    );

    if (jsonFiles.length === 0) {
      setError('No se encontraron archivos con extensión .json en la selección.');
      return;
    }

    const filesInfo: { name: string; type: string }[] = [];

    if (jsonFiles.length === 1) {
      try {
        const text = await jsonFiles[0].text();
        const parsed = JSON.parse(text);
        setJsonText(JSON.stringify(parsed, null, 2));
        const fileKind = parsed.course || parsed.modules
          ? 'Curso Completo'
          : (parsed.lesson || parsed.blocks ? 'Lección' : 'JSON');
        filesInfo.push({ name: jsonFiles[0].name, type: fileKind });
      } catch (err: any) {
        setError(`Error de sintaxis en "${jsonFiles[0].name}": ${err.message}`);
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
        setError(errors.join(' | '));
      }

      const bundlePayload = courseManifest || lessonFiles.length > 0
        ? { manifest: courseManifest, lessons: lessonFiles }
        : null;

      if (bundlePayload) {
        setJsonText(JSON.stringify(bundlePayload, null, 2));
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

    try {
      const filesArray = await getFilesFromDataTransfer(e.dataTransfer);
      if (filesArray.length > 0) {
        await processJsonFiles(filesArray);
      } else {
        setError('No se encontraron archivos .json en los elementos arrastrados.');
      }
    } catch (err: any) {
      setError(`Error al procesar archivos arrastrados: ${err.message}`);
    }
  };

  const handleUpload = async () => {
    if (!jsonText.trim() && loadedFilesInfo.length === 0) {
      setError('Por favor sube o arrastra un archivo JSON o pega el contenido JSON.');
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
      setLoadedFilesInfo([]);
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
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors space-y-4 ${
          isDragging
            ? 'border-[#0066CC] bg-[#0066CC]/10 dark:bg-[#0066CC]/20'
            : 'border-[#E0E0E0] dark:border-[#2D2D2D] hover:border-[#0066CC] dark:hover:border-[#4D94FF] bg-[#F5F5F5]/50 dark:bg-[#1A1A1A]/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          multiple
          onChange={(e) => {
            if (e.target.files) processJsonFiles(Array.from(e.target.files));
          }}
          className="hidden"
        />

        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory=""
          // @ts-ignore
          directory=""
          multiple
          onChange={(e) => {
            if (e.target.files) processJsonFiles(Array.from(e.target.files));
          }}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-xl bg-[#0066CC]/10 dark:bg-[#4D94FF]/20 text-[#0066CC] dark:text-[#4D94FF] flex items-center justify-center mx-auto">
          <Upload className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-[#1A1A1A] dark:text-white">
            Arrastra aquí tu carpeta de curso o múltiples archivos .json
          </p>
          <p className="text-xs text-[#666666] dark:text-[#808080]">
            Soporta archivos individuales, carpetas completas y paquetes modulares (course.json + lecciones).
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            📄 Seleccionar Múltiples Archivos JSON
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              folderInputRef.current?.click();
            }}
          >
            📁 Seleccionar Carpeta del Curso
          </Button>
        </div>

        {loadedFilesInfo.length > 0 && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-800 text-left max-h-48 overflow-y-auto space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              ✓ {loadedFilesInfo.length} Archivos cargados y listos:
            </span>
            {loadedFilesInfo.map((f, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded hover:bg-gray-100 dark:hover:bg-[#252525]">
                <span className="truncate font-mono">📄 {f.name}</span>
                <Badge variant="primary" className="text-[9px] py-0 px-1.5 shrink-0 ml-2">{f.type}</Badge>
              </div>
            ))}
          </div>
        )}
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
