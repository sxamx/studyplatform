# StudyPlatform - Documentación Técnica Completa

**Versión:** 1.0  
**Última actualización:** Agosto 2026  
**Estado:** Especificación de Proyecto - Pre-desarrollo

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Especificaciones de Diseño](#especificaciones-de-diseño)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Schema JSON Definitivo](#schema-json-definitivo)
5. [Base de Datos](#base-de-datos)
6. [API Endpoints](#api-endpoints)
7. [Flujos de Usuario](#flujos-de-usuario)
8. [Guía de Implementación](#guía-de-implementación)
9. [Seguridad](#seguridad)
10. [Deployment](#deployment)

---

## 🎯 Visión General

### Propósito
Plataforma de aprendizaje colaborativa tipo Duolingo, adaptable mediante JSON. Los administradores cargan contenido (cursos, lecciones, ejercicios) en formato JSON estructurado. Otros usuarios consumen el contenido y rastrean su progreso.

### Características Principales
- ✅ Sistema de administrador con roles basado en variables de entorno
- ✅ Cursos configurables mediante JSON
- ✅ Lecciones con múltiples tipos de bloques (texto, código, imágenes, preguntas)
- ✅ Validación estricta de JSON mediante JSON Schema
- ✅ Modo claro/oscuro
- ✅ Interfaz minimalista blanco/negro estilo Claude
- ✅ Responsive y accessible

### Stack Tecnológico Recomendado

**Backend:**
- Node.js 18+ (LTS)
- Express.js (framework)
- PostgreSQL o MongoDB (base de datos)
- JWT (autenticación)
- Zod o Ajv (validación JSON Schema)

**Frontend:**
- React 18+
- TypeScript
- Tailwind CSS (para consistencia de diseño)
- Zustand (state management)
- React Router v6

**DevOps:**
- Docker (containerización)
- GitHub Actions (CI/CD)
- Vercel/Railway/Render (hosting frontend)
- Railway/Heroku/DigitalOcean (hosting backend)

---

## 🎨 Especificaciones de Diseño

### Filosofía de Diseño
**Minimalismo funcional estilo Claude:** Interfaz limpia, enfoque en contenido, máximo contraste, tipografía clara.

### 1. Paleta de Colores

#### Modo Claro (Light Mode)

```
PRIMARY_BACKGROUND: #FFFFFF (RGB: 255, 255, 255)
SECONDARY_BACKGROUND: #F5F5F5 (RGB: 245, 245, 245)
TERTIARY_BACKGROUND: #ECECEC (RGB: 236, 236, 236)

TEXT_PRIMARY: #1A1A1A (RGB: 26, 26, 26)
TEXT_SECONDARY: #666666 (RGB: 102, 102, 102)
TEXT_TERTIARY: #999999 (RGB: 153, 153, 153)

BORDER_COLOR: #E0E0E0 (RGB: 224, 224, 224)
DIVIDER_COLOR: #F0F0F0 (RGB: 240, 240, 240)

ACCENT_PRIMARY: #0066CC (RGB: 0, 102, 204) - Para acciones principales
ACCENT_HOVER: #0052A3 (RGB: 0, 82, 163) - Hover sobre accent

SUCCESS_COLOR: #10A950 (RGB: 16, 169, 80)
ERROR_COLOR: #DC3545 (RGB: 220, 53, 69)
WARNING_COLOR: #FF9800 (RGB: 255, 152, 0)
INFO_COLOR: #2196F3 (RGB: 33, 150, 243)
```

#### Modo Oscuro (Dark Mode)

```
PRIMARY_BACKGROUND: #0F0F0F (RGB: 15, 15, 15)
SECONDARY_BACKGROUND: #1A1A1A (RGB: 26, 26, 26)
TERTIARY_BACKGROUND: #242424 (RGB: 36, 36, 36)

TEXT_PRIMARY: #FFFFFF (RGB: 255, 255, 255)
TEXT_SECONDARY: #B0B0B0 (RGB: 176, 176, 176)
TEXT_TERTIARY: #808080 (RGB: 128, 128, 128)

BORDER_COLOR: #2D2D2D (RGB: 45, 45, 45)
DIVIDER_COLOR: #1F1F1F (RGB: 31, 31, 31)

ACCENT_PRIMARY: #4D94FF (RGB: 77, 148, 255)
ACCENT_HOVER: #66A3FF (RGB: 102, 163, 255)

SUCCESS_COLOR: #2ECC71 (RGB: 46, 204, 113)
ERROR_COLOR: #FF6B6B (RGB: 255, 107, 107)
WARNING_COLOR: #FFB84D (RGB: 255, 184, 77)
INFO_COLOR: #64B5F6 (RGB: 100, 181, 246)
```

### 2. Tipografía

#### Fuentes
```
FUENTE_PRINCIPAL: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
FUENTE_CODIGO: 'Fira Code', 'Monaco', 'Courier New', monospace
```

#### Escala de Tamaños

| Uso | Tamaño | Peso | Altura de Línea | Letra-espacio |
|-----|--------|------|-----------------|---------------|
| H1 (Título página) | 32px | 700 (Bold) | 1.2 | -0.5px |
| H2 (Título sección) | 24px | 700 (Bold) | 1.3 | -0.3px |
| H3 (Título subsección) | 20px | 600 (Semi) | 1.4 | -0.2px |
| Cuerpo (Body) | 16px | 400 (Regular) | 1.5 | 0px |
| Pequeño (Small) | 14px | 400 (Regular) | 1.5 | 0px |
| Muy pequeño (Xs) | 12px | 400 (Regular) | 1.4 | 0px |
| Código | 13px | 400 (Regular) | 1.6 | 0.5px |

### 3. Espaciado (Sistema de Grid: 8px)

```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

### 4. Bordes y Radios

```
BORDER_WIDTH_THIN: 1px
BORDER_WIDTH_THICK: 2px

BORDER_RADIUS_SMALL: 4px
BORDER_RADIUS_MEDIUM: 8px
BORDER_RADIUS_LARGE: 12px
BORDER_RADIUS_FULL: 9999px
```

### 5. Sombras

#### Modo Claro
```
SHADOW_LIGHT: 0 1px 3px rgba(0, 0, 0, 0.08)
SHADOW_MEDIUM: 0 4px 6px rgba(0, 0, 0, 0.10)
SHADOW_HEAVY: 0 10px 20px rgba(0, 0, 0, 0.12)
SHADOW_FOCUS: 0 0 0 4px rgba(0, 102, 204, 0.1)
```

#### Modo Oscuro
```
SHADOW_LIGHT: 0 1px 3px rgba(0, 0, 0, 0.40)
SHADOW_MEDIUM: 0 4px 6px rgba(0, 0, 0, 0.50)
SHADOW_HEAVY: 0 10px 20px rgba(0, 0, 0, 0.60)
SHADOW_FOCUS: 0 0 0 4px rgba(77, 148, 255, 0.2)
```

### 6. Animaciones

```
DURATION_FAST: 150ms
DURATION_NORMAL: 300ms
DURATION_SLOW: 500ms

EASING_STANDARD: cubic-bezier(0.4, 0, 0.2, 1)
EASING_EASE_IN: cubic-bezier(0.4, 0, 1, 1)
EASING_EASE_OUT: cubic-bezier(0, 0, 0.2, 1)
```

### 7. Componentes Clave

#### Botón Primario
```
Tamaño: 44px altura
Padding: 12px 24px
Texto: 14px Semi-bold
Borde: 1px border-radius 8px
Fondo: ACCENT_PRIMARY
Texto: Blanco (modo claro y oscuro)
Hover: ACCENT_HOVER + SHADOW_MEDIUM
Transición: 150ms
```

#### Botón Secundario
```
Tamaño: 44px altura
Padding: 12px 24px
Texto: 14px Semi-bold
Borde: 1px BORDER_COLOR
Borde-radio: 8px
Fondo: Transparente
Texto: TEXT_PRIMARY
Hover: SECONDARY_BACKGROUND + SHADOW_LIGHT
```

#### Input Field
```
Altura: 44px
Padding: 12px 16px
Texto: 14px Regular
Borde: 1px BORDER_COLOR
Borde-radio: 8px
Fondo: PRIMARY_BACKGROUND (light) / TERTIARY_BACKGROUND (dark)
Foco: 2px solid ACCENT_PRIMARY + SHADOW_FOCUS
Transición: 150ms
```

#### Card
```
Padding: 24px
Borde: 1px BORDER_COLOR
Borde-radio: 8px
Fondo: PRIMARY_BACKGROUND (light) / SECONDARY_BACKGROUND (dark)
Sombra: SHADOW_LIGHT
Transición: 150ms al hover
```

#### Barra de Navegación (Header)
```
Altura: 64px
Padding: 16px 32px (horizontal)
Fondo: PRIMARY_BACKGROUND
Borde inferior: 1px BORDER_COLOR
Contenido: Logo (izq), Menú (der), Avatar usuario (esquina der)
Sticky: Sí, z-index 1000
```

#### Sidebar (Admin)
```
Ancho: 280px (desktop) / Drawer modal (mobile)
Altura: 100vh
Padding: 24px 16px
Fondo: SECONDARY_BACKGROUND
Borde derecho: 1px BORDER_COLOR
Items: 16px padding, 8px border-radius, hover TERTIARY_BACKGROUND
```

### 8. Breakpoints (Responsive)

```
MOBILE: < 640px
TABLET: 640px - 1024px
DESKTOP: > 1024px

MOBILE_HEADER_HEIGHT: 56px
TABLET_HEADER_HEIGHT: 64px
DESKTOP_HEADER_HEIGHT: 64px
```

### 9. Validación Visual (Estados de Inputs)

| Estado | Borde | Texto ayuda | Color |
|--------|-------|-------------|-------|
| Normal | BORDER_COLOR | - | - |
| Foco | ACCENT_PRIMARY | - | SHADOW_FOCUS |
| Error | ERROR_COLOR | Rojo | ERROR_COLOR |
| Success | SUCCESS_COLOR | Verde | SUCCESS_COLOR |
| Disabled | TERTIARY_BACKGROUND | Gris | TEXT_TERTIARY |

---

## 🏗️ Arquitectura del Sistema

### Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React + TS)                   │
├──────────────────────────┬──────────────────────────────────────┤
│  Rutas Públicas          │  Rutas Protegidas                    │
├──────────────────────────┼──────────────────────────────────────┤
│ /login                   │ /dashboard (estudiante)              │
│ /register                │ /courses/:id/lesson/:lessonId        │
│ /                        │ /progress                            │
│                          │ /admin/* (solo admin)                │
│                          │ /admin/courses/new                   │
│                          │ /admin/courses/:id/edit              │
│                          │ /admin/upload-json                   │
└──────────────────────────┴──────────────────────────────────────┘
                                    ↓↑
                            (REST API + JWT)
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                    │
├──────────────────────────┬──────────────────────────────────────┤
│ Auth Controller          │ Courses Controller                   │
│ ├─ POST /auth/register   │ ├─ GET /courses                      │
│ ├─ POST /auth/login      │ ├─ GET /courses/:id                  │
│ ├─ POST /auth/logout     │ ├─ POST /courses (admin)             │
│ ├─ GET /auth/me          │ ├─ PUT /courses/:id (admin)          │
│ └─ PATCH /auth/theme     │ └─ DELETE /courses/:id (admin)       │
│                          │                                      │
│ Lessons Controller       │ Upload Controller                    │
│ ├─ GET /lessons/:id      │ ├─ POST /upload/json (admin)         │
│ └─ POST /lessons (admin) │ ├─ POST /upload/image (admin)        │
│                          │ └─ POST /upload/video (admin)        │
│ Progress Controller      │                                      │
│ ├─ POST /progress        │ Admin Controller                     │
│ └─ GET /progress/:user   │ ├─ GET /admin/stats                  │
│                          │ └─ GET /admin/users                  │
└──────────────────────────┴──────────────────────────────────────┘
                                    ↓↑
                        (TypeORM/Prisma + Zod)
┌──────────────────────────────────────────────────────────────────┐
│                  DATABASE (PostgreSQL/MongoDB)                    │
├──────────────────────────┬──────────────────────────────────────┤
│ users                    │ courses                              │
│ ├─ id (PK)              │ ├─ id (PK)                           │
│ ├─ email (UNIQUE)       │ ├─ title                             │
│ ├─ passwordHash         │ ├─ description                       │
│ ├─ role (ADMIN|USER)    │ ├─ createdAt                         │
│ ├─ themePreference      │ ├─ updatedAt                         │
│ └─ createdAt            │ └─ createdBy (FK → users)            │
│                         │                                      │
│ lessons                 │ lesson_content (JSON)                │
│ ├─ id (PK)             │ ├─ id (PK)                           │
│ ├─ courseId (FK)       │ ├─ lessonId (FK)                     │
│ ├─ title               │ ├─ contentJSON (JSONB)               │
│ ├─ order               │ └─ version                           │
│ └─ createdAt           │                                      │
│                         │ user_progress                        │
│ media                   │ ├─ id (PK)                           │
│ ├─ id (PK)             │ ├─ userId (FK)                       │
│ ├─ type (image|video)  │ ├─ lessonId (FK)                     │
│ ├─ url                 │ ├─ completed (BOOLEAN)               │
│ ├─ uploadedAt          │ └─ completedAt                       │
│ └─ uploadedBy (FK)     │                                      │
└──────────────────────────┴──────────────────────────────────────┘
```

### Flujo de Autenticación

```
1. Usuario entra a /login
2. Ingresa email + password
3. Backend valida credenciales
4. Backend genera JWT (exp: 7 días)
5. Frontend guarda JWT en HttpOnly cookie
6. Cada request incluye JWT en header Authorization
7. Backend valida JWT en middleware
8. Si es válido, permite acceso; si no, redirecciona a /login
9. Admin tiene role="ADMIN" definido en DB
```

---

## 📊 Schema JSON Definitivo

### Estructura General de una Lección

```json
{
  "version": "1.0",
  "lesson": {
    "id": "lesson_uuid_1",
    "title": "Introdución a Variables en Java",
    "description": "Aprende a declarar y usar variables",
    "order": 1,
    "blocks": []
  }
}
```

### Tipos de Bloques Permitidos

#### 1. Text Block
```json
{
  "type": "text",
  "id": "text_1",
  "content": "Este es un párrafo de contenido educativo."
}
```

#### 2. Heading Block
```json
{
  "type": "heading",
  "id": "heading_1",
  "level": 2,
  "content": "Título de Sección"
}
```

#### 3. Code Block
```json
{
  "type": "code",
  "id": "code_1",
  "language": "java",
  "code": "public class HelloWorld {\n  public static void main(String[] args) {\n    System.out.println(\"Hello World\");\n  }\n}",
  "copyable": true
}
```

**Lenguajes soportados:**
- java, python, javascript, sql, c, cpp, csharp, html, css, json, yaml, xml, bash, rust, go, typescript

#### 4. Image Block
```json
{
  "type": "image",
  "id": "image_1",
  "url": "https://cdn.studyplatform.com/images/variable-diagram.png",
  "alt": "Diagrama de declaración de variable",
  "caption": "Cómo se declara una variable en Java",
  "width": 600,
  "height": 400
}
```

**Restricciones:**
- Formatos: jpg, png, webp
- Tamaño máximo: 5MB
- Debe tener `alt` para accesibilidad

#### 5. Video Block
```json
{
  "type": "video",
  "id": "video_1",
  "url": "https://cdn.studyplatform.com/videos/variable-tutorial.mp4",
  "title": "Tutorial de Variables",
  "duration": "5:30",
  "thumbnail": "https://cdn.studyplatform.com/videos/thumbnail.png"
}
```

**Restricciones:**
- Formatos: mp4, webm, ogg
- Duración máxima: 20 minutos
- Debe incluir thumbnail

#### 6. Multiple Choice Question Block
```json
{
  "type": "question_choice",
  "id": "question_1",
  "question": "¿Cuál es la sintaxis correcta para declarar una variable en Java?",
  "options": [
    {
      "id": "opt_1",
      "text": "int variable = 5;",
      "isCorrect": true
    },
    {
      "id": "opt_2",
      "text": "variable int = 5;",
      "isCorrect": false
    },
    {
      "id": "opt_3",
      "text": "var int = 5;",
      "isCorrect": false
    }
  ],
  "explanation": "En Java, el tipo va primero, luego el nombre de la variable.",
  "required": true
}
```

**Restricciones:**
- Mínimo 2 opciones, máximo 6
- Máximo 1 opción correcta
- Todas las opciones deben tener explicación mínima

#### 7. Free Text Question Block
```json
{
  "type": "question_free",
  "id": "question_2",
  "question": "Escribe un programa que imprima 'Hola Mundo'",
  "expectedAnswer": "public class HelloWorld {\n  public static void main(String[] args) {\n    System.out.println(\"Hola Mundo\");\n  }\n}",
  "maxLength": 500,
  "language": "java",
  "hint": "Recuerda que Java requiere una clase y un método main",
  "required": true
}
```

#### 8. Interactive Quiz Block
```json
{
  "type": "quiz",
  "id": "quiz_1",
  "title": "Quiz: Variables en Java",
  "description": "Responde las siguientes preguntas",
  "questions": [
    {
      "id": "q1",
      "type": "choice",
      "question": "¿Qué es una variable?",
      "options": [
        { "id": "o1", "text": "Un contenedor de datos", "isCorrect": true },
        { "id": "o2", "text": "Una función", "isCorrect": false }
      ]
    }
  ],
  "passingScore": 70,
  "required": true
}
```

#### 9. Info Block
```json
{
  "type": "info",
  "id": "info_1",
  "title": "Nota Importante",
  "message": "Las variables en Java deben ser inicializadas antes de usarse.",
  "level": "warning"
}
```

**Niveles:** info, warning, success, error

### Lección Completa (Ejemplo)

```json
{
  "version": "1.0",
  "lesson": {
    "id": "lesson_java_variables_001",
    "title": "Variables en Java",
    "description": "Aprende a trabajar con variables, tipos de datos y operaciones.",
    "order": 1,
    "estimatedMinutes": 15,
    "blocks": [
      {
        "type": "heading",
        "id": "h1",
        "level": 1,
        "content": "Introducción a Variables"
      },
      {
        "type": "text",
        "id": "text_1",
        "content": "Una variable es un contenedor que almacena un valor. En Java, debes especificar el tipo de dato."
      },
      {
        "type": "code",
        "id": "code_1",
        "language": "java",
        "code": "int edad = 25;\nString nombre = \"Juan\";\ndouble precio = 19.99;",
        "copyable": true
      },
      {
        "type": "info",
        "id": "info_1",
        "level": "info",
        "title": "Convención de Nombres",
        "message": "Usa camelCase para nombres de variables: miVariable, edadPersona, etc."
      },
      {
        "type": "question_choice",
        "id": "q1",
        "question": "¿Cuál es válido?",
        "options": [
          { "id": "o1", "text": "int 123var;", "isCorrect": false },
          { "id": "o2", "text": "int var123;", "isCorrect": true },
          { "id": "o3", "text": "int var-name;", "isCorrect": false }
        ],
        "explanation": "Los nombres deben empezar con letra.",
        "required": true
      }
    ]
  }
}
```

### Validaciones Obligatorias

Para cada bloque:
- ✅ `type` es uno de: text, heading, code, image, video, question_choice, question_free, quiz, info
- ✅ `id` es único dentro de la lección (no puede repetirse)
- ✅ Campos requeridos según tipo (ver arriba)
- ✅ Longitud de texto: máx 10,000 caracteres por bloque
- ✅ Código: máx 3,000 caracteres
- ✅ Imágenes: máx 5MB, formatos permitidos
- ✅ Videos: máx 20 minutos, formatos permitidos

**Lo que NO puede tocar una IA:**
- Parámetros de sistema (config, API keys)
- Estructura de BD
- Rutas de administración
- Roles y permisos

---

## 💾 Base de Datos

### Schema Completo (PostgreSQL)

```sql
-- Tabla: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
  theme_preference VARCHAR(10) DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Tabla: courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

-- Tabla: lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: lesson_content (JSON)
CREATE TABLE lesson_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: media
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(50),
  url VARCHAR(512),
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_public BOOLEAN DEFAULT false
);

-- Tabla: user_progress
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  answers JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

-- Tabla: audit_log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100),
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lesson_content_lesson_id ON lesson_content(lesson_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
```

### Índices para Performance

```sql
-- Búsquedas rápidas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_lessons_order ON lessons(course_id, order_index);
CREATE INDEX idx_progress_completion ON user_progress(user_id, completed);
```

---

## 🔌 API Endpoints

### Base URL
```
Production: https://api.studyplatform.com/v1
Development: http://localhost:3000/api/v1
```

### Autenticación
Todos los endpoints protegidos requieren:
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

### Auth Endpoints

#### POST /auth/register
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "Juan Pérez"
}

Response (201):
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

Error (400):
{
  "error": "Email already registered"
}
```

#### POST /auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "user": { "id": "uuid", "email": "user@example.com", "role": "USER" },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 604800
}
```

#### GET /auth/me
```json
Response (200):
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "Juan Pérez",
  "role": "USER",
  "themePreference": "light"
}
```

#### PATCH /auth/theme
```json
Request:
{
  "themePreference": "dark"
}

Response (200):
{
  "themePreference": "dark"
}
```

### Course Endpoints

#### GET /courses
```json
Response (200):
{
  "courses": [
    {
      "id": "uuid",
      "title": "Java Basics",
      "description": "Learn Java from scratch",
      "isPublished": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1
}
```

#### GET /courses/:id
```json
Response (200):
{
  "id": "uuid",
  "title": "Java Basics",
  "description": "...",
  "lessons": [
    {
      "id": "uuid",
      "title": "Variables",
      "order": 1
    }
  ]
}
```

#### POST /courses (Admin only)
```json
Request:
{
  "title": "Java Basics",
  "description": "Learn Java",
  "isPublished": false
}

Response (201):
{
  "id": "uuid",
  "title": "Java Basics",
  "createdBy": "uuid"
}
```

#### PUT /courses/:id (Admin only)
```json
Request:
{
  "title": "Java Basics Updated",
  "isPublished": true
}

Response (200):
{
  "id": "uuid",
  "title": "Java Basics Updated",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

#### DELETE /courses/:id (Admin only)
```json
Response (204): No Content
```

### Lesson Endpoints

#### GET /lessons/:id
```json
Response (200):
{
  "id": "uuid",
  "title": "Variables",
  "courseId": "uuid",
  "content": {
    "version": "1.0",
    "lesson": {
      "id": "...",
      "blocks": [...]
    }
  }
}
```

#### POST /lessons (Admin only)
```json
Request:
{
  "courseId": "uuid",
  "title": "Variables",
  "content": {...}
}

Response (201):
{
  "id": "uuid",
  "title": "Variables"
}
```

### Upload Endpoints

#### POST /upload/json (Admin only)
Sube un JSON de lección validado
```json
Request (multipart/form-data):
{
  "courseId": "uuid",
  "lessonTitle": "Variables",
  "jsonFile": <file>
}

Response (201):
{
  "id": "uuid",
  "title": "Variables",
  "validationStatus": "success",
  "blocksCount": 5
}

Error (400):
{
  "error": "Invalid JSON schema",
  "details": [
    {
      "path": "lesson.blocks[0]",
      "message": "type must be one of: text, heading, code..."
    }
  ]
}
```

#### POST /upload/image (Admin only)
```
Request (multipart/form-data):
{
  "image": <file>,
  "alt": "Variable diagram"
}

Response (201):
{
  "id": "uuid",
  "url": "https://cdn.studyplatform.com/images/...",
  "alt": "Variable diagram"
}
```

#### POST /upload/video (Admin only)
```
Request (multipart/form-data):
{
  "video": <file>,
  "title": "Tutorial",
  "thumbnail": <file>
}

Response (201):
{
  "id": "uuid",
  "url": "https://cdn.studyplatform.com/videos/...",
  "duration": "5:30"
}
```

### Progress Endpoints

#### POST /progress
Registra que un usuario completó una lección
```json
Request:
{
  "lessonId": "uuid",
  "answers": {
    "question_1": "opt_1",
    "question_2": "Este es mi código..."
  }
}

Response (201):
{
  "id": "uuid",
  "lessonId": "uuid",
  "completed": true,
  "completedAt": "2024-01-15T10:00:00Z"
}
```

#### GET /progress
```json
Response (200):
{
  "progress": [
    {
      "lessonId": "uuid",
      "courseId": "uuid",
      "completed": true,
      "completedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Admin Endpoints

#### GET /admin/stats
```json
Response (200):
{
  "totalUsers": 150,
  "totalCourses": 5,
  "totalLessons": 45,
  "activeUsersThisWeek": 42,
  "averageCompletionRate": 73.5
}
```

#### GET /admin/users
```json
Response (200):
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "USER",
      "createdAt": "2024-01-10T00:00:00Z",
      "lastLoginAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## 👥 Flujos de Usuario

### 1. Registro e Inicio de Sesión

```
Visitante
  ↓
¿Tiene cuenta?
  ├─ No → Pantalla /register
  │         ├─ Completa formulario
  │         ├─ Backend valida email único
  │         ├─ Hash password (bcrypt)
  │         ├─ Crea user con role="USER"
  │         ├─ Genera JWT
  │         └─ Redirecciona a /dashboard
  │
  └─ Sí → Pantalla /login
          ├─ Ingresa email + password
          ├─ Backend verifica hash
          ├─ Genera JWT (exp: 7 días)
          ├─ Guarda en HttpOnly cookie
          └─ Redirecciona a /dashboard
```

### 2. Estudiante - Ver Cursos y Completar Lecciones

```
Estudiante autenticado
  ↓
/dashboard → Lista cursos disponibles
  ↓
Click en curso → /courses/:id
  ├─ Muestra: título, descripción, progreso
  ├─ Lista lecciones ordenadas
  │
  └─ Click en lección → /courses/:id/lesson/:lessonId
      ├─ Carga JSON de lección
      ├─ Renderiza bloques en orden
      ├─ Usuario lee/ve contenido
      ├─ Responde preguntas
      ├─ Click "Completar"
      └─ POST /progress → Marca como completado
```

### 3. Admin - Crear Curso desde JSON

```
Admin autenticado
  ↓
/admin/courses/new → Formulario
  ├─ Nombre curso
  ├─ Descripción
  └─ Click "Crear" → Course creado
  ↓
/admin/courses/:id → Interfaz de gestión
  ├─ Click "Subir JSON"
  │   ├─ Selecciona archivo JSON
  │   ├─ Sistema valida JSON Schema
  │   ├─ ✅ Válido → "Válido" verde
  │   ├─ ❌ Inválido → Muestra errores específicos
  │   └─ Admin corrige y reintenta
  │
  └─ Lección creada con bloques
```

### 4. Admin - Subir Imágenes/Videos

```
Admin en /admin/upload-media
  ├─ Click "Seleccionar imagen"
  ├─ Sistema valida: formato, tamaño
  ├─ Comprime si es necesario
  ├─ Sube a CDN (AWS S3 o Cloudinary)
  ├─ Obtiene URL
  └─ Admin copia URL para usar en JSON
```

---

## 🛠️ Guía de Implementación

### Fase 1: Setup Inicial (Semana 1)

#### 1.1 Crear repositorio
```bash
git clone https://github.com/tu-usuario/studyplatform.git
cd studyplatform
```

#### 1.2 Estructura de carpetas
```
studyplatform/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── lessons/
│   │   ├── media/
│   │   ├── admin/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   └── app.ts
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── shared/ (Button, Input, Card, etc.)
│   │   │   ├── lesson/ (LessonViewer, BlockRenderer, etc.)
│   │   │   ├── admin/ (CourseForm, UploadJSON, etc.)
│   │   │   └── auth/ (LoginForm, RegisterForm)
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── theme.css (variables de diseño)
│   │   │   └── tailwind.config.js
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── docs/
│   ├── API.md
│   ├── SCHEMA.md
│   ├── DESIGN.md
│   └── DEPLOYMENT.md
│
├── docker-compose.yml
├── README.md
└── CONTRIBUTING.md
```

#### 1.3 Variables de entorno

**.env.backend:**
```
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/studyplatform

# Auth
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=tu@email.com

# Mail (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu@gmail.com
SMTP_PASS=password

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
CDN_URL=https://cdn.studyplatform.com

# CORS
FRONTEND_URL=http://localhost:5173
```

**.env.frontend:**
```
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=StudyPlatform
VITE_APP_VERSION=1.0.0
```

#### 1.4 Iniciar desarrollo

**Backend:**
```bash
cd backend
npm install
npm run dev
# Corre en http://localhost:3000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Corre en http://localhost:5173
```

### Fase 2: Base de Datos (Semana 1-2)

```bash
# Backend: Crear migraciones
npm run migrations:generate CreateUsersTable
npm run migrations:generate CreateCoursesTable
npm run migrations:generate CreateLessonsTable
# ... etc

# Ejecutar migraciones
npm run migrations:run
```

### Fase 3: Autenticación (Semana 2)

Implementar en orden:
1. POST /auth/register
2. POST /auth/login
3. POST /auth/logout
4. GET /auth/me (protegido)
5. JWT middleware
6. Roles (ADMIN vs USER)

### Fase 4: Cursos y Lecciones (Semana 2-3)

1. CRUD de cursos (solo admin)
2. CRUD de lecciones
3. Validación JSON Schema
4. Renderización de bloques

### Fase 5: Frontend Principal (Semana 3-4)

1. Autenticación (login/register)
2. Dashboard de estudiante
3. Viewer de lecciones
4. Renderizador de bloques
5. Modo claro/oscuro

### Fase 6: Admin Panel (Semana 4-5)

1. Interfaz de admin
2. Formulario de cursos
3. Upload de JSON
4. Upload de media
5. Gestión de usuarios

### Fase 7: Polish y Testing (Semana 5-6)

1. Testing unitario
2. Testing de integración
3. Optimización de performance
4. Mobile responsive
5. Accesibilidad (WCAG)

---

## 🔐 Seguridad

### Autenticación
- ✅ Passwords hasheadas con bcrypt (10 rounds mínimo)
- ✅ JWT para sesiones (HttpOnly cookies)
- ✅ HTTPS en producción (obligatorio)
- ✅ CSRF protection

### Validación
- ✅ JSON Schema validation en backend
- ✅ Input sanitization
- ✅ Rate limiting en auth endpoints
- ✅ Validación de tipos en TypeScript

### Autorización
- ✅ Middleware de roles (ADMIN/USER)
- ✅ Admin email en env variable (no hardcoded)
- ✅ Audit log de acciones administrativas

### Data
- ✅ JSONB validation en PostgreSQL
- ✅ Encriptación de datos sensibles
- ✅ Backup automático de BD
- ✅ GDPR compliance (derecho al olvido)

### API
- ✅ Rate limiting por IP
- ✅ CORS whitelist
- ✅ Helmet.js para headers HTTP
- ✅ Validación de Content-Type
- ✅ Max request size limits

### Lo que la IA NO puede hacer
```javascript
// ❌ PROHIBIDO
// - Modificar archivos de configuración
// - Cambiar estructura de base de datos
// - Crear nuevos roles o permisos
// - Tocar JWT secrets
// - Acceso a rutas admin
// - Modificar parámetros de sistema

// ✅ PERMITIDO
// - Crear contenido de bloques (texto, código, preguntas)
// - Generar JSON válido según schema
// - Cambiar orden de bloques
// - Modificar títulos y descripciones
```

---

## 🚀 Deployment

### Opción 1: Railway (Recomendado para empezar)

1. **Backend en Railway:**
   ```bash
   railway login
   railway init
   railway env:add DATABASE_URL postgresql://...
   railway env:add JWT_SECRET ...
   railway env:add ADMIN_EMAIL ...
   railway up
   ```

2. **Frontend en Vercel:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

### Opción 2: Docker Compose

```bash
# En producción
docker-compose -f docker-compose.prod.yml up -d
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: studyplatform
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/studyplatform
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:3000"
    environment:
      VITE_API_URL: https://api.studyplatform.com
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Checklist Pre-producción

- [ ] Variables de entorno configuradas
- [ ] HTTPS activado
- [ ] Base de datos respaldada
- [ ] JWT secret seguro (36+ caracteres)
- [ ] CORS configurado correctamente
- [ ] Rate limiting activo
- [ ] Logging centralizado
- [ ] Error tracking (Sentry)
- [ ] Monitoring (Uptime Robot)
- [ ] Backups automáticos

---

## 📚 Referencias

### Stack Recomendado
- **Node.js:** https://nodejs.org
- **Express:** https://expressjs.com
- **TypeScript:** https://www.typescriptlang.org
- **React:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **PostgreSQL:** https://www.postgresql.org
- **Zod/Ajv:** JSON Schema validation

### Recursos de Seguridad
- OWASP Top 10: https://owasp.org/Top10/
- JWT Best Practices: https://tools.ietf.org/html/rfc7519
- bcrypt: https://www.npmjs.com/package/bcrypt

---

**Versión:** 1.0  
**Estado:** Pre-desarrollo  
**Última actualización:** Agosto 2026  
**Autor:** Tu nombre  
**Licencia:** MIT
