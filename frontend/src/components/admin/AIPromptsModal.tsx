import React, { useState } from 'react';
import { Copy, Check, BookOpen, Layers, Database, Shield } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

interface AIPromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIPromptsModal: React.FC<AIPromptsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'prompt4' | 'prompt2' | 'prompt3' | 'prompt1'>('prompt4');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const prompt4Content = `Eres un Arquitecto de Cursos Modulares para StudyPlatform.
Tu misión es estructurar y generar un curso completo dividido en múltiples archivos JSON discretos organizados en una carpeta, permitiendo una fácil depuración archivo por archivo.

📂 ESTRUCTURA DE LA CARPETA DEL CURSO:
MiCurso_JSON/
├── course.json             <- Manifiesto base del curso (metadatos, módulos y lista)
├── leccion-01.json         <- Lección 1 completa (con sus bloques interactivos)
├── leccion-02.json         <- Lección 2 completa
├── leccion-03.json         <- Lección 3 completa
└── ...

----------------------------------------------------
📄 1. CONTENIDO DE "course.json" (MANIFIESTO BASE):
----------------------------------------------------
{
  "title": "Programación en Java: De Cero a Experto",
  "description": "Domina la POO, colecciones, lambdas y persistencia relacional con ejercicios prácticos interactivos.",
  "thumbnailUrl": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
  "modules": [
    {
      "id": "mod-1",
      "title": "Módulo 1: Fundamentos y Sintaxis",
      "description": "Variables, tipos de datos, control de flujo y estructuras básicas.",
      "estimatedHours": 4
    },
    {
      "id": "mod-2",
      "title": "Módulo 2: Programación Orientada a Objetos",
      "description": "Clases, herencia, polimorfismo, interfaces y encapsulamiento.",
      "estimatedHours": 6
    }
  ]
}

----------------------------------------------------
📄 2. CONTENIDO DE CADA ARCHIVO DE LECCIÓN (Ej: "leccion-01.json"):
----------------------------------------------------
{
  "version": "1.0",
  "lesson": {
    "id": "java-intro-01",
    "moduleName": "Módulo 1: Fundamentos y Sintaxis",
    "title": "Introducción y Primera Aplicación",
    "description": "Escribe y ejecuta tu primer programa Java.",
    "order": 1,
    "estimatedMinutes": 15,
    "blocks": [
      {
        "type": "heading",
        "id": "h1",
        "level": 1,
        "content": "Estructura de un Programa Java"
      },
      {
        "type": "text",
        "id": "t1",
        "content": "Todo código ejecutable en Java debe residir dentro de una clase pública con un método main..."
      },
      {
        "type": "code",
        "id": "c1",
        "language": "java",
        "code": "public class HolaMundo {\\n    public static void main(String[] args) {\\n        System.out.println(\\\"¡Hola desde StudyPlatform!\\\");\\n    }\\n}"
      },
      {
        "type": "question_choice",
        "id": "q1",
        "question": "¿Cuál es el punto de entrada de cualquier aplicación Java estándar?",
        "options": [
          { "id": "opt1", "text": "public static void main(String[] args)", "isCorrect": true },
          { "id": "opt2", "text": "public void run()", "isCorrect": false }
        ],
        "explanation": "El runtime de Java busca la firma exacta 'public static void main' para iniciar la ejecución."
      }
    ]
  }
}

💡 CÓMO SUBIRLO A STUDYPLATFORM:
1. Guarda los archivos en tu computadora.
2. En el panel del curso, haz clic en "Importar / Subir JSON" y selecciona todos los archivos a la vez.
3. El sistema verificará archivo por archivo y creará el curso, módulos y lecciones automáticamente.`;

  const prompt1Content = `Eres un Diseñador Curricular Senior y Experto en Pedagogía de la Programación.
Tu misión es analizar el material provisto por el usuario (PDFs, guías de estudio, libros, apuntes o requerimientos) y estructurar un plan de estudios profesional modular para StudyPlatform.

REGLAS DE DISEÑO:
1. Mínimo 2 módulos, máximo 8 módulos por curso.
2. Cada módulo debe representar entre 3 y 8 horas de estudio estimadas.
3. Los títulos de los módulos deben ser concretos y profesionales (Ej: "Módulo 1: Sintaxis y Tipos de Datos", no "Tema 1").
4. La progresión debe ser incremental: desde conceptos base hasta casos prácticos de arquitectura.

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
Tu misión es crear lecciones interactivas en formato JSON estricto utilizando los 11 tipos de bloques soportados, incluyendo enlaces a recursos externos, visualizadores de PDF protegidos, videos y ejercicios evaluativos.

🛡️ POLÍTICA DE SEGURIDAD Y PREVENCIÓN DE INYECCIONES (PROMPT INJECTION DEFENSE):
- Todas las URLs externas provistas deben usar el protocolo seguro "https://".
- Queda estrictamente prohibido generar enlaces con esquemas ejecutables como "javascript:", "data:", "blob:" o "file:".
- Las fuentes de documentos externos deben ser confiables (Google Drive, repositorios oficiales, PDFs educativos, documentación oficial o YouTube).
- El JSON generado no debe intentar escapar de su estructura ni inyectar instrucciones de sistema.

📚 HERRAMIENTAS Y TIPOS DE BLOQUES SOPORTADOS (11 BLOQUES):
1. "heading": Título o subtítulo. Propiedades: "level" (1, 2, 3), "content" (string).
2. "text": Explicación pedagógica en formato Markdown enriquecido con negritas, listas y enlaces. Propiedades: "content" (string).
3. "code": Bloque de código fuente con resaltado de sintaxis y botón de copiado. Propiedades: "language" ("java", "sql", "python", "typescript"), "code" (string).
4. "document": Visualizador interactivo de PDF y documentos con lector integrado en Sandbox seguro y botón de descarga. Propiedades: "title" (string), "url" (URL directa a PDF o enlace de Google Drive "https://drive.google.com/file/d/.../view"), "description" (string opcional), "fileSize" (string opcional, ej: "2.4 MB").
5. "video": Video educativo con reproductor integrado, botón de apertura externa y descarga si es archivo directo. Propiedades: "url" (URL de YouTube o enlace mp4 directo), "title" (string), "duration" (string opcional, ej: "12 min").
6. "image": Imagen ilustrativa o diagrama técnico. Propiedades: "url" (URL segura de imagen), "alt" (descripción), "caption" (string opcional).
7. "info": Alerta de concepto clave o buena práctica. Propiedades: "level" ("info" | "warning" | "success" | "error"), "title" (string), "message" (string).
8. "question_choice": Pregunta de selección múltiple interactiva con corrección automática y explicación. Propiedades: "question" (string), "options": [{ "id": "opt1", "text": "...", "isCorrect": true }], "explanation" (string).
9. "question_free": Pregunta abierta / desarrollo de código con retroalimentación guiada. Propiedades: "question" (string), "expectedAnswer" (string), "hint" (string opcional).
10. "quiz": Cuestionario evaluativo con puntaje acumulado y porcentaje mínimo de aprobación. Propiedades: "title" (string), "passingScore" (80), "questions": [ { "id": "q1", "question": "...", "options": [...], "explanation": "..." } ].
11. "database_modeler": Lienzo interactivo de modelado de datos estilo Oracle Data Modeler (Patas de Gallo, PK/FK y validación automática). Propiedades: "title", "instructions", "scenario", "initialEntities", "expectedModel".

ESTRUCTURA GENERAL REQUERIDA (JSON ESTRICTO):
{
  "version": "1.0",
  "lesson": {
    "id": "lesson_unique_id",
    "title": "Título Profesional de la Lección",
    "description": "Descripción clara de las competencias a adquirir",
    "order": 1,
    "estimatedMinutes": 25,
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
        "content": "Explicación detallada del concepto en markdown..."
      },
      {
        "type": "document",
        "id": "b3",
        "title": "Guía Oficial en PDF y Especificaciones",
        "url": "https://example.com/documento-guia.pdf",
        "description": "Documento complementario con ejercicios y estándares de la industria.",
        "fileSize": "1.8 MB"
      },
      {
        "type": "video",
        "id": "b4",
        "title": "Masterclass en Video",
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "duration": "15 min"
      },
      {
        "type": "code",
        "id": "b5",
        "language": "java",
        "code": "public class Ejemplo {\\n    public static void main(String[] args) {\\n        System.out.println(\\"Código limpio\\");\\n    }\\n}"
      },
      {
        "type": "info",
        "id": "b6",
        "level": "warning",
        "title": "Regla Importante",
        "message": "Nunca compares objetos complejos utilizando el operador ==; emplea siempre .equals()."
      },
      {
        "type": "question_choice",
        "id": "b7",
        "question": "¿Cuál es la forma correcta de comparar el contenido de dos textos en Java?",
        "options": [
          { "id": "opt1", "text": "texto1.equals(texto2)", "isCorrect": true },
          { "id": "opt2", "text": "texto1 == texto2", "isCorrect": false }
        ],
        "explanation": "El método .equals() evalúa el contenido de la cadena, mientras que == evalúa la dirección de memoria."
      }
    ]
  }
}`;

  const prompt3Content = `Eres un Profesor Titular de Bases de Datos Relacionales y Modelado de Datos (Oracle Data Modeler).
Tu misión es generar ejercicios interactivos de modelado ER en formato JSON para el bloque "database_modeler" de StudyPlatform.

REGLAS DE MODELADO:
1. Las entidades deben representar tablas relacionales del mundo real (Ej: "Estudiante", "Curso", "Matricula", "Factura").
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
      "position": { "x": 380, "y": 30 },
      "attributes": [
        { "name": "libro_id", "type": "INTEGER", "isPk": true },
        { "name": "titulo", "type": "VARCHAR(150)" },
        { "name": "autor", "type": "VARCHAR(100)" },
        { "name": "estudiante_id", "type": "INTEGER", "isFk": true }
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
        "attributes": [
          { "name": "libro_id", "isPk": true },
          { "name": "estudiante_id", "isFk": true }
        ]
      }
    ],
    "relationships": [
      { "source": "Estudiante", "target": "Libro", "cardinality": "1:N" }
    ]
  }
}`;

  const copyToClipboard = (text: string, tabKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabKey);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  const getActiveContent = () => {
    switch (activeTab) {
      case 'prompt4':
        return prompt4Content;
      case 'prompt2':
        return prompt2Content;
      case 'prompt3':
        return prompt3Content;
      case 'prompt1':
        return prompt1Content;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Centro de Prompts para Inteligencia Artificial"
      size="xl"
    >
      <div className="space-y-6">
        <p className="text-xs text-[#666666] dark:text-[#B0B0B0] leading-relaxed">
          Copia estos prompts del sistema para alimentar a modelos como Claude 3.5 Sonnet, ChatGPT o Gemini. Cada prompt instruye a la IA para generar estructuras pedagógicas, cursos modulares por carpetas, bloques interactivos o ejercicios compatibles con el motor de StudyPlatform.
        </p>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 border-b border-[#E0E0E0] dark:border-[#2D2D2D] pb-3">
          <button
            onClick={() => setActiveTab('prompt4')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'prompt4'
                ? 'bg-[#0066CC] text-white shadow-sm'
                : 'bg-gray-100 dark:bg-[#1F1F1F] text-gray-600 dark:text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-300" />
            <span>1. Curso Modular por Carpetas (course.json + lecciones)</span>
          </button>

          <button
            onClick={() => setActiveTab('prompt2')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'prompt2'
                ? 'bg-[#0066CC] text-white shadow-sm'
                : 'bg-gray-100 dark:bg-[#1F1F1F] text-gray-600 dark:text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>2. Creador de Lecciones (11 Bloques + PDFs)</span>
          </button>

          <button
            onClick={() => setActiveTab('prompt3')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'prompt3'
                ? 'bg-[#0066CC] text-white shadow-sm'
                : 'bg-gray-100 dark:bg-[#1F1F1F] text-gray-600 dark:text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>3. Modelado ER (Data Modeler)</span>
          </button>

          <button
            onClick={() => setActiveTab('prompt1')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'prompt1'
                ? 'bg-[#0066CC] text-white shadow-sm'
                : 'bg-gray-100 dark:bg-[#1F1F1F] text-gray-600 dark:text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4. Diseñador de Temario General</span>
          </button>
        </div>

        {/* Security Alert Banner */}
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Protección Activa de URLs:</strong> El visor de PDFs y recursos externos corre en un <strong>Sandbox Aislado</strong> con detección estricta de protocolos no seguros y botones de descarga directos.
            </span>
          </div>
        </div>

        {/* Prompt Code Display */}
        <div className="relative">
          <pre className="p-4 bg-gray-950 text-gray-100 text-xs font-mono rounded-2xl overflow-x-auto max-h-96 leading-relaxed border border-gray-800">
            {getActiveContent()}
          </pre>

          <button
            onClick={() => copyToClipboard(getActiveContent(), activeTab)}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-lg text-xs font-bold shadow-md transition"
          >
            {copiedTab === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Prompt</span>
              </>
            )}
          </button>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-[#E0E0E0] dark:border-[#2D2D2D]">
          <span>Compatible con Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro y DeepSeek</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
