# 📋 Documento de Requisitos, Mejoras y Especificaciones Futuras para StudyPlatform

Este documento recopila el estado actual de la plataforma, el feedback de diseño, los nuevos requisitos funcionales y la visión arquitectónica para la siguiente fase de desarrollo. Está formateado para servir como base de refinamiento con un asistente de arquitectura o ingeniería de prompts.

---

## 1. Estado Actual de la Plataforma (Línea Base)

Actualmente, **StudyPlatform** cuenta con una base funcional completa y en producción:
- **Backend:** Node.js v24 con SQLite nativo (`node:sqlite` / `DatabaseSync`), validación estricta con **Zod**, autenticación **JWT** y hashing **bcrypt**. Preparado para **Cloudflare Workers** y **Cloudflare D1**.
- **Frontend:** React + Vite + TypeScript + Tailwind CSS (Estética minimalista Claude con paletas `#0066CC`, `#4D94FF`, `#1A1A1A`, `#0F0F0F`, tipografía Inter y Fira Code).
- **Gamificación:** Barra de progreso en tiempo real por lección, modal de finalización con confeti animado (`canvas-confetti`) y persistencia de respuestas.
- **Motor JSON:** 9 tipos de bloques interactivos implementados (`text`, `heading`, `code`, `image`, `video`, `question_choice`, `question_free`, `quiz`, `info`).
- **Panel de Administración Actual:** Métricas de analítica, gestor de cursos básico y uploader de JSON con drag & drop y editor de texto plano.

---

## 2. Nuevos Requisitos y Mejoras Solicitadas

### 🎯 A. Jerarquía y Subdivisión de Cursos (Estructura Multicapa)
Actualmente, el sistema vincula lecciones directamente a un curso (`Curso -> Lecciones`). Se requiere ampliar la arquitectura para permitir subdivisiones más profundas y pedagógicas:

1. **Jerarquía Deseada:**
   - **Categoría / Ruta de Aprendizaje (Tracks):** Ej. *Lenguajes de Programación*, *Desarrollo Web*, *Ciencia de Datos*.
   - **Curso:** Ej. *Java*, *Python*, *TypeScript*.
   - **Módulos / Secciones (Subdivisiones):** Creados y organizados pedagógicamente (Ej. *Módulo 1: Sintaxis y Tipos de Datos*, *Módulo 2: Control de Flujo*, *Módulo 3: Programación Orientada a Objetos*).
   - **Lecciones:** Cada lección vive dentro de un módulo y está compuesta por el flujo de bloques interactivos JSON.
2. **Autonomía de la IA:**
   - La IA debe tener la capacidad de decidir la cantidad de módulos, los nombres temáticos de cada módulo y el orden de las lecciones a partir de un objetivo general o material de referencia.

---

### 🎨 B. Editor Visual No-Code de Cursos y Lecciones (Panel Admin)
Actualmente, la edición o subida de lecciones se hace mediante código JSON crudo. Se requiere un **modo de edición visual dual** en el Panel de Administración:

1. **Editor de Lecciones por Bloques (WYSIWYG):**
   - El administrador debe poder modificar lecciones sin tocar código JSON.
   - **Añadir bloques:** Botón flotante para insertar cualquier tipo de bloque (`+ Texto`, `+ Código`, `+ Video`, `+ Pregunta Selección`, `+ Alerta Info`, etc.) en cualquier posición.
   - **Reordenar bloques:** Posibilidad de subir o bajar bloques con controles sencillos.
   - **Edición en línea:** Cambiar textos, corregir erratas, agregar o quitar opciones de una pregunta de selección múltiple, o modificar pistas (`hint`) directamente desde formularios visuales.
2. **Modo Dual (Visual <-> JSON):**
   - Pestaña para alternar entre **"Modo Editor Visual"** y **"Modo JSON Crudo"** con sincronización bidireccional instantánea.

---

### 🤖 C. System Prompt para la IA Generadora de Contenido
Se diseñará un *System Prompt* maestro independiente (`docs/SYSTEM_PROMPT_CREATOR.md`) enfocado en la IA externa que generará el contenido educativo:
- **Función:** Permitir que el usuario simplemente le envíe archivos (PDFs, transcripciones, resúmenes, código de ejemplo) y la IA sepa de inmediato:
  1. Cómo segmentar el contenido en módulos lógicos.
  2. Cómo construir el JSON de cada lección respetando el esquema Zod y las reglas de diseño (proporción de bloques teóricos vs interactivos, calidad de explicaciones, pistas útiles).
  3. No requerir prompts repetitivos por parte del usuario.

---

### 🏷️ D. Ajustes de Marca y Experiencia de Usuario (UI/UX)
1. **Eslogan del Navbar:**
   - **Estado actual:** Dice `"Aprende con JSON"` debajo de *StudyPlatform*.
   - **Cambio requerido:** Cambiar a `"Aprende"` o eliminar el subtítulo técnico para que el usuario final no vea referencias a la arquitectura interna de datos.
2. **Transición de Demo a Producción:**
   - Limpiar las etiquetas `"Demo"` de la interfaz (botones de inicio rápido en `/login`, nombres de usuarios semilla) para dejar una experiencia lista para distribución pública.

---

## 3. Próximos Pasos del Flujo de Trabajo

```
[Este Documento de Requisitos]
         │
         ▼
[Refinamiento con IA Arquitecta / Documentadora]
         │
         ▼
[Documentación Formal de Especificación Técnica]
         │
         ▼
[Implementación en Antigravity (Base de Datos + Editor Visual + UI)]
```
