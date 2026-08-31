# 🎓 StudyPlatform - Plataforma de Estudio Interactiva Estilo "Duolingo" (100% JSON Driven)

StudyPlatform es una plataforma educativa interactiva inspirada en Duolingo y construida siguiendo los estándares de diseño minimalista de Claude (`#0066CC`, `#4D94FF`, `#1A1A1A`, `#0F0F0F`, tipografía Inter y Fira Code). Cada curso y lección se genera y renderiza dinámicamente a partir de archivos **JSON validados con Zod**.

---

## ⚡ Características Principales

- **9 Tipos de Bloques Interactivos Soportados:**
  1. `text`: Texto explicativo con formato limpio.
  2. `heading`: Encabezados jerárquicos (H1 a H6).
  3. `code`: Bloques de código con fuente Fira Code, badge de lenguaje y botón para copiar con feedback instantáneo.
  4. `image`: Imágenes con pie de foto y ajuste responsivo.
  5. `video`: Videos embebibles (YouTube, Vimeo, MP4 directos) con indicador de duración.
  6. `question_choice`: Preguntas de selección múltiple con retroalimentación inmediata, explicaciones detalladas y colores de acierto/error.
  7. `question_free`: Preguntas de respuesta libre/código con acordeón de pistas (`hint`) y solución esperada.
  8. `quiz`: Cuestionarios multironda con cálculo de puntaje, umbral de aprobación y posibilidad de reintento.
  9. `info`: Cajas de alerta temáticas (`info`, `warning`, `success`, `error`).

- **Flujo de Estudio Estilo Duolingo:**
  - Barra de progreso interactiva en tiempo real por cada lección.
  - Celebración con animación de confeti (`canvas-confetti`) al finalizar cada lección.
  - Navegación fluida entre lecciones anteriores y siguientes.
  - Guardado persistente de respuestas y porcentaje de avance.

- **Panel de Administración Completo:**
  - Métricas de analítica (usuarios totales, cursos activos, lecciones completadas, tasa de progreso).
  - Gestor visual de cursos (crear, editar, eliminar y publicar cursos).
  - Validador y subidor de JSON con **Drag & Drop**, editor de código en vivo y detección de errores de esquema Zod en tiempo real.

- **Autenticación y Cuentas Demo:**
  - Cuentas de demostración de 1-clic:
    - **Admin:** `admin@studyplatform.com` / `Admin123456!`
    - **Estudiante:** `estudiante@studyplatform.com` / `Student123456!`
  - Registro de nuevos usuarios y soporte de temas (Modo Claro / Modo Oscuro).

---

## 🚀 Inicio Rápido Local

### 1. Requisitos
- **Node.js**: v18+ (Compatible y probado con Node.js v24 y `node:sqlite` nativo).

### 2. Instalación de Dependencias
```bash
# En el directorio raíz:
npm install --prefix backend
npm install --prefix frontend
```

### 3. Cargar Lecciones Iniciales (Seed)
```bash
npm run seed --prefix backend
```
> Esto cargará automáticamente las 5 lecciones de ejemplo validadas de Java y Programación Orientada a Objetos.

### 4. Iniciar la Aplicación en Desarrollo
```bash
# Iniciar backend y frontend simultáneamente:
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3000/api/v1](http://localhost:3000/api/v1)

---

## ☁️ Despliegue en Cloudflare Free Tier (Costo $0)

StudyPlatform está diseñado para ejecutarse 100% en el **Free Tier de Cloudflare**:

| Componente | Servicio Cloudflare | Límite Free Tier |
|---|---|---|
| **Frontend** | Cloudflare Pages | Ilimitado ancho de banda y despliegues automáticos desde Git |
| **Backend API** | Cloudflare Workers | 100,000 peticiones diarias gratis |
| **Base de Datos** | Cloudflare D1 (SQLite en el Edge) | 5M lecturas/día, 100k escrituras/día, 5GB almacenamiento |
| **Multimedia** | Cloudflare R2 | 10GB almacenamiento gratis/mes |

### Pasos para Desplegar:

1. **Instalar Wrangler CLI:**
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. **Crear la Base de Datos Cloudflare D1:**
   ```bash
   wrangler d1 create studyplatform-db
   ```
   Copia el `database_id` generado en `backend/wrangler.toml`.

3. **Ejecutar el Esquema SQL en D1:**
   ```bash
   wrangler d1 execute studyplatform-db --file=backend/src/database/schema.sql
   ```

4. **Desplegar el Backend (Worker):**
   ```bash
   cd backend
   wrangler deploy
   ```

5. **Desplegar el Frontend (Cloudflare Pages):**
   ```bash
   cd frontend
   npm run build
   wrangler pages deploy dist --project-name=studyplatform
   ```

---

## 📋 Ejemplo de Estructura de Lección JSON

```json
{
  "version": "1.0",
  "lesson": {
    "id": "mi_leccion_01",
    "title": "Mi Primera Lección Interactiva",
    "description": "Lección de prueba con bloques interactivos",
    "order": 1,
    "estimatedMinutes": 10,
    "blocks": [
      {
        "type": "heading",
        "id": "h1",
        "level": 1,
        "content": "Introducción al Tema"
      },
      {
        "type": "text",
        "id": "t1",
        "content": "Aprenderemos los conceptos básicos paso a paso."
      },
      {
        "type": "code",
        "id": "c1",
        "language": "java",
        "code": "int puntuacion = 100;\nSystem.out.println(puntuacion);",
        "copyable": true
      },
      {
        "type": "question_choice",
        "id": "q1",
        "question": "¿Qué imprime el código anterior?",
        "options": [
          { "id": "opt_1", "text": "100", "isCorrect": true },
          { "id": "opt_2", "text": "puntuacion", "isCorrect": false }
        ],
        "explanation": "La variable almacena el valor numérico 100 y System.out.println lo muestra en consola."
      }
    ]
  }
}
```

---

## 🔒 Arquitectura de Seguridad
- Autenticación mediante **JWT (JSON Web Tokens)** con roles de usuario (`ADMIN` / `USER`).
- Hasheo criptográfico de contraseñas con **bcrypt**.
- Sanitización y validación estricta de esquemas de entrada con **Zod**.
- Base de datos con soporte de transacciones ACID y claves foráneas habilitadas.
