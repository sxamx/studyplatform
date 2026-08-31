# StudyPlatform - Guía Rápida del Proyecto

## 📌 Resumen Ejecutivo

**StudyPlatform** es una plataforma de aprendizaje colaborativa estilo Duolingo, altamente adaptable mediante JSON. Los administradores cargan contenido (cursos, lecciones, ejercicios) en formato JSON. Los estudiantes consumen el contenido y rastrean su progreso.

### ¿Por qué JSON?
✅ Totalmente personalizable sin tocar código  
✅ Fácil de generar con IA (Gemini, ChatGPT, etc.)  
✅ Validación automática = seguridad  
✅ Escalable a cualquier tipo de contenido  

---

## 🎯 Estructura del Proyecto

```
studyplatform/
├── 📄 STUDYPLATFORM_DOCUMENTATION.md (Especificación completa)
├── 📄 README_PROYECTO.md (Este archivo)
├── backend/                   # Node.js + Express
│   ├── src/
│   │   ├── auth/             # Login, register, JWT
│   │   ├── courses/          # CRUD de cursos
│   │   ├── lessons/          # CRUD de lecciones
│   │   ├── media/            # Upload de imágenes/videos
│   │   ├── admin/            # Panel de administración
│   │   ├── middleware/       # Auth, validación
│   │   └── utils/            # Helpers
│   ├── tests/                # Tests unitarios
│   ├── .env.example          # Variables de entorno
│   └── package.json
│
├── frontend/                  # React + TypeScript
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── shared/       # Button, Input, Card, etc.
│   │   │   ├── lesson/       # Visor de lecciones
│   │   │   ├── admin/        # Panel admin
│   │   │   └── auth/         # Login/Register
│   │   ├── pages/            # Páginas principales
│   │   ├── hooks/            # React hooks custom
│   │   ├── utils/            # Funciones auxiliares
│   │   ├── styles/           # CSS + Tailwind config
│   │   ├── types/            # TypeScript types
│   │   └── App.tsx
│   ├── public/               # Assets estáticos
│   ├── .env.example
│   └── package.json
│
├── docs/                      # Documentación
│   ├── API.md                # Especificación REST API
│   ├── DESIGN.md             # Especificaciones de diseño
│   ├── SCHEMA.md             # Schema JSON
│   └── DEPLOYMENT.md         # Deploy a producción
│
└── docker-compose.yml        # Stack completo en Docker
```

---

## 🎨 Diseño Visual

### Filosofía
**Minimalista blanco/negro estilo Claude** con modo claro/oscuro.

### Colores Principales (Modo Claro)
```
Fondo:        #FFFFFF
Texto:        #1A1A1A
Acento:       #0066CC (Azul claro)
Borde:        #E0E0E0
```

### Colores Principales (Modo Oscuro)
```
Fondo:        #0F0F0F
Texto:        #FFFFFF
Acento:       #4D94FF (Azul brillante)
Borde:        #2D2D2D
```

### Tipografía
```
Fuente:       Inter (body), Fira Code (código)
H1:           32px Bold
H2:           24px Bold
Body:         16px Regular
```

---

## 📊 Schema JSON - Estructura de Lecciones

Una lección es un JSON con bloques de contenido:

```json
{
  "version": "1.0",
  "lesson": {
    "id": "lesson_uuid",
    "title": "Introdución a Variables en Java",
    "blocks": [
      {
        "type": "heading",
        "id": "h1",
        "level": 1,
        "content": "Variables"
      },
      {
        "type": "text",
        "id": "text_1",
        "content": "Una variable es un contenedor..."
      },
      {
        "type": "code",
        "id": "code_1",
        "language": "java",
        "code": "int edad = 25;"
      },
      {
        "type": "question_choice",
        "id": "q1",
        "question": "¿Cuál es válido?",
        "options": [
          { "id": "o1", "text": "int var = 5;", "isCorrect": true },
          { "id": "o2", "text": "var int = 5;", "isCorrect": false }
        ],
        "explanation": "El tipo va primero"
      }
    ]
  }
}
```

### Tipos de Bloques Permitidos
| Tipo | Uso | Límites |
|------|-----|---------|
| `text` | Párrafos | 10,000 caracteres |
| `heading` | Títulos (H1-H6) | - |
| `code` | Bloques código | 3,000 caracteres, 12 lenguajes |
| `image` | Imágenes | 5MB, JPG/PNG/WebP |
| `video` | Videos | 20 min, MP4/WebM/OGG |
| `question_choice` | Opción múltiple | 2-6 opciones |
| `question_free` | Respuestas abiertas | 500 caracteres |
| `quiz` | Quiz interactivo | Múltiples preguntas |
| `info` | Notas/Warnings | 4 niveles |

---

## 🔐 Seguridad - Lo que la IA PUEDE y NO PUEDE hacer

### ✅ LA IA PUEDE:
- Generar bloques de contenido (texto, código, preguntas)
- Crear JSON válido según el schema
- Modificar títulos, descripciones, orden de bloques
- Generar imágenes y videos (si está integrado)

### ❌ LA IA NO PUEDE:
- Modificar archivos de configuración
- Cambiar estructura de base de datos
- Crear nuevos roles o permisos
- Tocar JWT secrets o API keys
- Acceder a rutas admin
- Modificar parámetros del sistema

**La validación JSON Schema en backend rechaza todo lo que no sea contenido válido.**

---

## 🔧 Setup Rápido (Desarrollo)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tus valores
npm run dev
# Corre en http://localhost:3000
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# Corre en http://localhost:5173
```

### 3. Base de Datos
```bash
# Crear DB
createdb studyplatform

# Ejecutar migraciones
npm run migrations:run
```

---

## 📋 Admin - Crear un Curso desde JSON

### Paso 1: Crear Curso
```bash
POST /courses
{
  "title": "Java Basics",
  "description": "Aprende Java desde cero"
}
```

### Paso 2: Subir JSON
```bash
POST /upload/json
{
  "courseId": "uuid",
  "lessonTitle": "Variables",
  "jsonFile": <archivo.json>
}
```

La API valida automáticamente:
- ✅ Estructura JSON correcta
- ✅ Todos los bloques tienen tipos válidos
- ✅ IDs únicos dentro de la lección
- ✅ Campos requeridos completados

Si hay error, retorna:
```json
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

---

## 🚀 API Endpoints Principales

### Autenticación
```
POST   /auth/register    - Registrarse
POST   /auth/login       - Iniciar sesión
GET    /auth/me          - Datos del usuario actual
PATCH  /auth/theme       - Cambiar tema (light/dark)
```

### Cursos
```
GET    /courses          - Listar todos
GET    /courses/:id      - Ver detalles
POST   /courses          - Crear (admin)
PUT    /courses/:id      - Editar (admin)
DELETE /courses/:id      - Eliminar (admin)
```

### Lecciones
```
GET    /lessons/:id      - Ver lección completa
POST   /lessons          - Crear (admin)
```

### Upload
```
POST   /upload/json      - Subir JSON validado (admin)
POST   /upload/image     - Subir imagen (admin)
POST   /upload/video     - Subir video (admin)
```

### Progreso
```
POST   /progress         - Marcar como completado
GET    /progress         - Ver mi progreso
```

---

## 💾 Base de Datos - Tablas Principales

### users
```sql
id (UUID)
email (UNIQUE)
password_hash
role ('ADMIN' | 'USER')
theme_preference ('light' | 'dark' | 'system')
created_at
```

### courses
```sql
id (UUID)
title
description
created_by (FK → users)
is_published (BOOLEAN)
created_at
```

### lessons
```sql
id (UUID)
course_id (FK → courses)
title
order_index (posición en curso)
created_at
```

### lesson_content
```sql
id (UUID)
lesson_id (FK → lessons)
content (JSONB) ← JSON con bloques
version (control de versiones)
```

### user_progress
```sql
id (UUID)
user_id (FK → users)
lesson_id (FK → lessons)
completed (BOOLEAN)
answers (JSONB) ← Respuestas del usuario
completed_at
```

---

## 🎓 Ejemplo Completo: Crear un Curso de Java

### 1. Crear Curso
```bash
curl -X POST http://localhost:3000/api/v1/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Java para Principiantes",
    "description": "Aprende Java desde cero"
  }'

# Respuesta:
# { "id": "abc-123-def", "title": "Java para Principiantes" }
```

### 2. Crear JSON de Lección
```json
{
  "version": "1.0",
  "lesson": {
    "id": "lesson_1",
    "title": "Variables en Java",
    "estimatedMinutes": 15,
    "blocks": [
      {
        "type": "heading",
        "id": "h1",
        "level": 1,
        "content": "¿Qué es una variable?"
      },
      {
        "type": "text",
        "id": "text_1",
        "content": "Una variable es un contenedor que almacena un valor. En Java debes especificar el tipo."
      },
      {
        "type": "code",
        "id": "code_1",
        "language": "java",
        "code": "int edad = 25;\nString nombre = \"Juan\";\ndouble precio = 19.99;",
        "copyable": true
      },
      {
        "type": "question_choice",
        "id": "q1",
        "question": "¿Cuál declaración es válida?",
        "options": [
          { "id": "o1", "text": "int 123var;", "isCorrect": false },
          { "id": "o2", "text": "int var123;", "isCorrect": true },
          { "id": "o3", "text": "int var-name;", "isCorrect": false }
        ],
        "explanation": "Los nombres de variables deben empezar con una letra.",
        "required": true
      },
      {
        "type": "info",
        "id": "info_1",
        "level": "info",
        "title": "Tip",
        "message": "Usa camelCase: miVariable, edadPersona, precioProducto"
      }
    ]
  }
}
```

### 3. Subir JSON
```bash
curl -X POST http://localhost:3000/api/v1/upload/json \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "courseId=abc-123-def" \
  -F "lessonTitle=Variables en Java" \
  -F "jsonFile=@leccion.json"

# Respuesta:
# { "id": "lesson_uuid", "title": "Variables en Java", "blocksCount": 5 }
```

### 4. Estudiante accede
```bash
curl http://localhost:3000/api/v1/courses/abc-123-def
# Frontend renderiza la lección con todos los bloques
# Estudiante lee, responde preguntas
# POST /progress → Marca como completado
```

---

## 🌐 Deployment

### Opción 1: Railway (Recomendado - Fácil)
```bash
# Backend
railway login
railway init
railway up

# Frontend (Vercel)
vercel --prod
```

### Opción 2: Docker Compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Checklist Pre-producción
- [ ] Variables de entorno configuradas (JWT_SECRET, ADMIN_EMAIL, etc.)
- [ ] HTTPS activado
- [ ] Base de datos respaldada
- [ ] CORS correctamente configurado
- [ ] Rate limiting activo
- [ ] Logging centralizado
- [ ] Email de recuperación funciona
- [ ] Backups automáticos configurados

---

## 📚 Documentación Adicional

- **STUDYPLATFORM_DOCUMENTATION.md** - Especificación completa (95% del proyecto)
- **/docs/API.md** - Todos los endpoints REST
- **/docs/SCHEMA.md** - Especificación completa de JSON schema
- **/docs/DESIGN.md** - Guía de diseño pixel-perfect
- **/docs/DEPLOYMENT.md** - Pasos para producción

---

## 🤖 Usando IA para Generar Contenido

### Ejemplo: Prompts para Gemini/ChatGPT

```markdown
Genera un JSON de lección sobre "Arrays en Java" siguiendo este schema:

```json
{
  "version": "1.0",
  "lesson": {
    "id": "lesson_unique_id",
    "title": "Arrays en Java",
    "blocks": [
      // Máximo 15 bloques
      // Tipos: text, heading, code, image, video, question_choice, question_free, quiz, info
      // Cada bloque debe tener "type" e "id" único
      // No modifiques parámetros de sistema, solo contenido
    ]
  }
}
```

Usa estos lenguajes para código: java, python, javascript, sql, c, cpp

Incluye 3-5 preguntas tipo choice con explicaciones.
```

---

## ❓ FAQ

**P: ¿Cómo hago admin a un usuario?**  
R: Se define al iniciar via variable de entorno `ADMIN_EMAIL` en `.env`. Solo esa persona tiene permisos.

**P: ¿Puedo compartir cursos entre usuarios?**  
R: Sí, los cursos publicados (`is_published: true`) son públicos. Cualquier usuario registrado puede verlos.

**P: ¿Hay límite de estudiantes?**  
R: No, escala con PostgreSQL. Recomendado hasta 10,000 usuarios en Railway free.

**P: ¿Puedo cambiar el diseño después?**  
R: Sí, toda la UI es CSS. Tailwind permite cambios rápidos sin reescribir HTML.

**P: ¿Los estudiantes pueden hacer sus propios cursos?**  
R: Por defecto no. Podrías agregar un rol `CREATOR` si lo necesitas.

---

## 📞 Soporte

Para dudas sobre la arquitectura o implementación:
1. Lee STUDYPLATFORM_DOCUMENTATION.md
2. Revisa los ejemplos en /docs
3. Consulta los comentarios en el código

---

**Versión:** 1.0  
**Estado:** Pre-desarrollo  
**Stack:** Node.js + React + PostgreSQL  
**Licencia:** MIT  
**Última actualización:** Agosto 2026  

**¡Listo para comenzar! 🚀**
