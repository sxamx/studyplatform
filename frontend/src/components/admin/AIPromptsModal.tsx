import React, { useState } from 'react';
import { Copy, Check, BookOpen, Layers, Database, Code2 } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

interface AIPromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIPromptsModal: React.FC<AIPromptsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'prompt1' | 'prompt2' | 'prompt3'>('prompt2');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const prompt1Content = `Eres un Diseñador Curricular Senior y Experto en Pedagogía de la Programación.
Tu misión es analizar el material provisto por el usuario (PDF, apuntes, libros o requerimientos) y proponer una estructura pedagógica modular para StudyPlatform.

REGLAS DE DISEÑO:
1. Mínimo 2 módulos, máximo 8 módulos por curso.
2. Cada módulo debe representar entre 3 y 8 horas de estudio estimadas.
3. Los títulos de los módulos deben ser concretos y profesionales (Ej: "Módulo 1: Sintaxis y Tipos de Datos", no "Tema 1").
4. La progresión debe ser incremental: desde conceptos base hasta casos prácticos.

FORMATO DE SALIDA (JSON ESTRICTO):
{
  "title": "Nombre profesional del curso",
  "description": "Descripción concisa de lo que el alumno dominará al finalizar",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "estimatedHours": 20,
  "proposedModules": [
    {
      "number": 1,
      "title": "Módulo 1: Fundamentos y Sintaxis",
      "description": "Resumen de lo que aprenderá en este módulo",
      "estimatedHours": 5,
      "suggestedLessonCount": 3
    }
  ]
}`;

  const prompt2Content = `Eres un Desarrollador de Contenido Educativo Interactivo para StudyPlatform.
Tu misión es crear lecciones interactivas en formato JSON estricto utilizando los 10 tipos de bloques soportados.

HERRAMIENTAS / BLOQUES DISPONIBLES EN EL JSON:
1. "heading": Título o sección. Propiedades: "level" (1, 2, 3), "content" (string).
2. "text": Explicación teórica en formato markdown. Propiedades: "content" (string).
3. "code": Código fuente con resaltado. Propiedades: "language" (ej. "java", "python", "sql"), "code" (string), "executable" (boolean opcional).
4. "info": Alerta de teoría destacada. Propiedades: "level" ("info" | "warning" | "success" | "tip"), "title" (string), "message" (string), "link" (opcional: { "url": "https://...", "text": "Ver recurso" }).
5. "video": Video educativo. Propiedades: "url" (YouTube o URL directa), "title" (string), "caption" (string opcional).
6. "question_choice": Pregunta de opción múltiple. Propiedades: "question" (string), "options": [{ "id": "o1", "text": "Opción A", "isCorrect": true }], "explanation": "Por qué es correcta".
7. "question_free": Pregunta abierta / desarrollo. Propiedades: "question" (string), "hint" (string opcional), "explanation" (string).
8. "quiz": Cuestionario evaluativo. Propiedades: "title" (string), "questions": [ { "id": "q1", "question": "...", "options": [...], "explanation": "..." } ], "passingScore": 80.
9. "database_modeler": Lienzo de modelado ER (Oracle Data Modeler en navegador). Propiedades: "title", "instructions", "scenario", "initialEntities", "expectedModel" con entidades esperadas y relaciones ("1:1", "1:N", "N:M").
10. "sandbox": Laboratorio de código interactivo. Propiedades: "language", "initialCode", "instructions".

ESTRUCTURA GENERAL REQUERIDA (JSON ESTRICTO):
{
  "version": "1.0",
  "lesson": {
    "id": "lesson_unique_id",
    "title": "Título de la Lección",
    "description": "Descripción clara de los objetivos de la lección",
    "order": 1,
    "estimatedMinutes": 20,
    "blocks": [
      {
        "type": "heading",
        "id": "b1",
        "level": 1,
        "content": "Introducción al Tema"
      },
      {
        "type": "text",
        "id": "b2",
        "content": "Explicación detallada del concepto con formato markdown..."
      },
      {
        "type": "code",
        "id": "b3",
        "language": "java",
        "code": "public class Main {\\n    public static void main(String[] args) {\\n        System.out.println(\\"Hola Mundo\\");\\n    }\\n}"
      },
      {
        "type": "question_choice",
        "id": "b4",
        "question": "¿Cuál es la función del método main en Java?",
        "options": [
          { "id": "opt1", "text": "Punto de entrada para la ejecución del programa", "isCorrect": true },
          { "id": "opt2", "text": "Definir las variables globales", "isCorrect": false }
        ],
        "explanation": "El método main es el punto de partida que la JVM ejecuta al iniciar la aplicación."
      }
    ]
  }
}`;

  const prompt3Content = `Eres un Profesor Titular de Bases de Datos Relacionales y Modelado de Datos (Oracle Data Modeler).
Tu misión es generar ejercicios interactivos de modelado ER en formato JSON para el bloque "database_modeler" de StudyPlatform.

REGLAS DE MODELADO:
1. Las entidades deben representar tablas del mundo real (Ej: "Estudiante", "Curso", "Matricula", "Factura").
2. Atributos con Clave Primaria ("isPk": true), Clave Foránea ("isFk": true) y tipo SQL ("INTEGER", "VARCHAR(100)", "DATE", "DECIMAL(10,2)").
3. Relaciones con cardinalidad exacta: "1:1", "1:N" o "N:M".
4. Incluir "expectedModel" para que el motor valide automáticamente el diseño del alumno.

ESTRUCTURA DE UN BLOQUE "database_modeler" EN JSON:
{
  "type": "database_modeler",
  "id": "er_block_01",
  "title": "Diseño del Sistema de Préstamos de Biblioteca",
  "instructions": "Crea las entidades requeridas, define sus atributos PK/FK y establece las relaciones con la cardinalidad correcta.",
  "scenario": "Una biblioteca necesita registrar Estudiantes y Libros. Un estudiante puede solicitar múltiples préstamos de libros a lo largo del semestre.",
  "hint": "Crea una tabla 'Prestamo' intermedia con 'prestamo_id' (PK), 'estudiante_id' (FK) y 'libro_id' (FK).",
  "initialEntities": [
    {
      "id": "ent_estudiante",
      "name": "Estudiante",
      "position": { "x": 30, "y": 30 },
      "attributes": [
        { "name": "estudiante_id", "type": "INTEGER", "isPk": true },
        { "name": "nombre", "type": "VARCHAR(100)" },
        { "name": "carrera", "type": "VARCHAR(100)" }
      ]
    },
    {
      "id": "ent_libro",
      "name": "Libro",
      "position": { "x": 320, "y": 30 },
      "attributes": [
        { "name": "libro_id", "type": "INTEGER", "isPk": true },
        { "name": "titulo", "type": "VARCHAR(150)" },
        { "name": "autor", "type": "VARCHAR(100)" }
      ]
    }
  ],
  "expectedModel": {
    "entities": [
      {
        "name": "Estudiante",
        "attributes": [{ "name": "estudiante_id", "isPk": true }]
      },
      {
        "name": "Libro",
        "attributes": [{ "name": "libro_id", "isPk": true }]
      }
    ],
    "relationships": [
      { "source": "Estudiante", "target": "Libro", "cardinality": "1:N" }
    ]
  }
}`;

  const getActiveContent = () => {
    switch (activeTab) {
      case 'prompt1':
        return prompt1Content;
      case 'prompt2':
        return prompt2Content;
      case 'prompt3':
        return prompt3Content;
    }
  };

  const handleCopy = async () => {
    const text = getActiveContent();
    await navigator.clipboard.writeText(text);
    setCopiedTab(activeTab);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🤖 Centro de Prompts para IA (Manual de Capacidades JSON)"
      size="full"
    >
      <div className="space-y-5">
        <p className="text-xs text-[#666666] dark:text-[#B0B0B0] leading-relaxed">
          Copia cualquiera de estos <strong>System Prompts</strong> y pégalos en ChatGPT, Claude, DeepSeek o Gemini. La IA entenderá exactamente cómo estructurar cursos, módulos, lecciones y los <strong>10 tipos de bloques interactivos</strong> compatibles con StudyPlatform.
        </p>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 dark:bg-[#141414] rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D]">
          <button
            type="button"
            onClick={() => setActiveTab('prompt2')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'prompt2'
                ? 'bg-[#0066CC] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Lecciones Interactivas (10 Bloques)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('prompt3')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'prompt3'
                ? 'bg-[#0066CC] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>2. Modelador ER (Data Modeler)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('prompt1')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'prompt1'
                ? 'bg-[#0066CC] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>3. Arquitecto de Temarios (Módulos)</span>
          </button>
        </div>

        {/* Action Header & Code Area */}
        <div className="relative">
          <div className="flex items-center justify-between p-3 bg-gray-900 text-white rounded-t-xl border-b border-gray-800">
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#4D94FF]" />
              System Prompt listo para usar
            </span>

            <Button
              variant="primary"
              size="sm"
              onClick={handleCopy}
              leftIcon={
                copiedTab === activeTab ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )
              }
            >
              {copiedTab === activeTab ? '¡Copiado al Portapapeles!' : 'Copiar Prompt'}
            </Button>
          </div>

          <pre className="p-4 bg-gray-950 text-gray-200 font-mono text-xs rounded-b-xl overflow-x-auto max-h-[380px] whitespace-pre-wrap leading-relaxed border border-gray-800">
            {getActiveContent()}
          </pre>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
