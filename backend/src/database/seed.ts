import { getDb } from './db';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const db = getDb();

console.log('🌱 Starting comprehensive database seeding v2.0 (with Database Modeler)...');

// 1. Users
const adminPasswordHash = '$2b$10$wO8XJk.u6B2tT4d7W2i4ue6O2Y8K3wK.u6B2tT4d7W2i4ue6O2Y8K'; // Admin123456!
const userPasswordHash = '$2b$10$wO8XJk.u6B2tT4d7W2i4ue6O2Y8K3wK.u6B2tT4d7W2i4ue6O2Y8K';

let adminUser = db.prepare("SELECT id FROM users WHERE email = 'admin@studyplatform.com'").get() as any;
if (!adminUser) {
  const adminId = 'admin-user-0001';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, role, full_name, theme_preference)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(adminId, 'admin@studyplatform.com', adminPasswordHash, 'ADMIN', 'Administrador Principal', 'system');
  adminUser = { id: adminId };
}
const adminId = adminUser.id;

let studentUser = db.prepare("SELECT id FROM users WHERE email = 'student@studyplatform.com'").get() as any;
if (!studentUser) {
  const studentId = 'student-user-0001';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, role, full_name, theme_preference)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(studentId, 'student@studyplatform.com', userPasswordHash, 'USER', 'Estudiante Demo', 'dark');
  studentUser = { id: studentId };
}
const studentId = studentUser.id;

// 2. Learning Tracks
const tracks = [
  {
    id: 'track-backend',
    title: 'Desarrollo Backend',
    description: 'Especialízate en arquitecturas de servidor, APIs robustas y lenguajes fuertemente tipados.',
    slug: 'desarrollo-backend',
    icon: 'Server',
    orderIndex: 1,
  },
  {
    id: 'track-database',
    title: 'Bases de Datos y Modelado',
    description: 'Aprende diseño relacional, diagramas entidad-relación, normalización y SQL avanzado.',
    slug: 'bases-de-datos',
    icon: 'Database',
    orderIndex: 2,
  },
  {
    id: 'track-fundamentals',
    title: 'Fundamentos de Algoritmia',
    description: 'Domina los conceptos clave de ciencias de la computación, lógica y estructuras.',
    slug: 'fundamentos-de-algoritmia',
    icon: 'Code',
    orderIndex: 3,
  }
];

for (const t of tracks) {
  db.prepare(`
    INSERT INTO learning_tracks (id, title, description, slug, icon, order_index, is_published)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      slug = excluded.slug,
      icon = excluded.icon,
      order_index = excluded.order_index
  `).run(t.id, t.title, t.description, t.slug, t.icon, t.orderIndex);
}

// 3. Courses
const courses = [
  {
    id: 'course-databases-er',
    trackId: 'track-database',
    title: 'Modelado de Bases de Datos y Diagramas ER',
    description: 'Aprende a diseñar esquemas entidad-relación profesionales (estilo Oracle Data Modeler) con evaluación interactiva.',
    slug: 'modelado-bases-de-datos',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80',
    orderIndex: 1,
  },
  {
    id: 'course-java-fundamentals',
    trackId: 'track-backend',
    title: 'Java para Principiantes',
    description: 'Aprende Java desde cero: variables, estructuras de control, bucles, arreglos y programación moderna.',
    slug: 'java-para-principiantes',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    orderIndex: 2,
  },
  {
    id: 'course-intro-programming',
    trackId: 'track-fundamentals',
    title: 'Introducción a la Programación',
    description: 'Fundamentos universales de lógica, algoritmos y tu primer programa.',
    slug: 'introduccion-a-la-programacion',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    orderIndex: 3,
  },
  {
    id: 'course-oop-java',
    trackId: 'track-backend',
    title: 'Programación Orientada a Objetos',
    description: 'Domina clases, objetos, constructores y métodos con ejemplos interactivos y visuales.',
    slug: 'programacion-orientada-a-objetos',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    orderIndex: 4,
  }
];

for (const c of courses) {
  db.prepare(`
    INSERT INTO courses (id, track_id, title, description, slug, thumbnail_url, created_by, is_published, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    ON CONFLICT(id) DO UPDATE SET
      track_id = excluded.track_id,
      title = excluded.title,
      description = excluded.description,
      slug = excluded.slug,
      thumbnail_url = excluded.thumbnail_url,
      order_index = excluded.order_index
  `).run(c.id, c.trackId, c.title, c.description, c.slug, c.thumbnailUrl, adminId, c.orderIndex);
}

// 4. Modules
const modulesList = [
  {
    id: 'mod-db-01',
    courseId: 'course-databases-er',
    title: 'Módulo 1: Diseño Entidad-Relación y Tablas',
    description: 'Aprende a identificar entidades, atributos y cardinalidades en casos reales.',
    orderIndex: 1,
    estimatedHours: 4,
  },
  {
    id: 'mod-java-01',
    courseId: 'course-java-fundamentals',
    title: 'Módulo 1: Sintaxis y Tipos de Datos',
    description: 'Conceptos fundamentales, tipos primitivos y variables.',
    orderIndex: 1,
    estimatedHours: 4,
  },
  {
    id: 'mod-java-02',
    courseId: 'course-java-fundamentals',
    title: 'Módulo 2: Estructuras de Control y Arreglos',
    description: 'Sentencias condicionales, bucles for/while y manejo de listas.',
    orderIndex: 2,
    estimatedHours: 6,
  }
];

for (const m of modulesList) {
  db.prepare(`
    INSERT INTO modules (id, course_id, title, description, order_index, estimated_hours)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      order_index = excluded.order_index,
      estimated_hours = excluded.estimated_hours
  `).run(m.id, m.courseId, m.title, m.description, m.orderIndex, m.estimatedHours);
}

// 5. Seed Interactive Database Modeler Lesson
const dbLessonJson = {
  version: '1.0',
  lesson: {
    id: 'lesson-db-er-library',
    title: 'Diseño ER: Biblioteca Universitaria',
    description: 'Práctica interactiva de modelado de datos con lienzo visual y validación automática.',
    order: 1,
    estimatedMinutes: 25,
    blocks: [
      {
        type: 'heading',
        id: 'db_h1',
        level: 1,
        content: 'Modelado Entidad-Relación en el Navegador',
      },
      {
        type: 'text',
        id: 'db_t1',
        content: 'En esta lección aprenderás a transformar un caso de uso real en un diagrama Entidad-Relación (ER) profesional. Podrás crear tablas, definir claves primarias (PK), claves foráneas (FK) y trazar relaciones con cardinalidad (1:1, 1:N, N:M) directamente en el lienzo.',
      },
      {
        type: 'info',
        id: 'db_i1',
        level: 'info',
        title: 'Regla de Claves Foráneas (FK)',
        message: 'En una relación 1:N, la clave primaria de la tabla del lado "1" se propaga como clave foránea (FK) en la tabla del lado "N".',
      },
      {
        type: 'database_modeler',
        id: 'db_er1',
        title: 'Práctica: Sistema de Gestión de Biblioteca',
        instructions: 'Crea las entidades Estudiante, Libro y Prestamo. Define sus claves primarias, claves foráneas y conecta las relaciones 1:N correspondientes.',
        scenario: 'La universidad necesita registrar Estudiantes (con estudiante_id y nombre) y Libros (con isbn y titulo). Cada vez que un estudiante retira un libro, se registra un Prestamo (con prestamo_id, fecha_prestamo, estudiante_id y isbn). Un estudiante puede realizar múltiples préstamos y un libro puede registrar múltiples préstamos históricos.',
        initialEntities: [
          {
            id: 'ent_estudiante_seed',
            name: 'Estudiante',
            position: { x: 50, y: 70 },
            attributes: [
              { name: 'estudiante_id', type: 'INTEGER', isPk: true },
              { name: 'nombre', type: 'VARCHAR(100)' },
            ],
          },
          {
            id: 'ent_libro_seed',
            name: 'Libro',
            position: { x: 450, y: 70 },
            attributes: [
              { name: 'isbn', type: 'VARCHAR(20)', isPk: true },
              { name: 'titulo', type: 'VARCHAR(150)' },
            ],
          },
        ],
        expectedModel: {
          entities: [
            {
              name: 'Estudiante',
              attributes: [{ name: 'estudiante_id', isPk: true }, { name: 'nombre' }],
            },
            {
              name: 'Libro',
              attributes: [{ name: 'isbn', isPk: true }, { name: 'titulo' }],
            },
            {
              name: 'Prestamo',
              attributes: [
                { name: 'prestamo_id', isPk: true },
                { name: 'estudiante_id', isFk: true },
                { name: 'isbn', isFk: true },
                { name: 'fecha_prestamo' },
              ],
            },
          ],
          relationships: [
            { source: 'Estudiante', target: 'Prestamo', cardinality: '1:N' },
            { source: 'Libro', target: 'Prestamo', cardinality: '1:N' },
          ],
        },
        hint: 'Crea una tabla llamada "Prestamo" que contenga prestamo_id como PK, y estudiante_id + isbn como claves foráneas (FK), luego relaciona Estudiante ⟷ Prestamo (1:N) y Libro ⟷ Prestamo (1:N).',
        required: true,
      },
      {
        type: 'question_choice',
        id: 'db_q1',
        question: '¿Por qué la tabla Prestamo necesita claves foráneas hacia Estudiante y Libro?',
        options: [
          { id: 'opt_1', text: 'Para asociar qué estudiante pidió qué libro y garantizar integridad referencial', isCorrect: true },
          { id: 'opt_2', text: 'Para que la base de datos ocupe menos espacio en disco', isCorrect: false },
          { id: 'opt_3', text: 'Porque SQL no permite tablas sin claves foráneas', isCorrect: false },
        ],
        explanation: 'Las claves foráneas (FK) permiten establecer vínculos relacionales e integridad referencial entre registros de distintas tablas.',
        required: true,
      },
    ],
  },
};

db.prepare(`
  INSERT INTO lessons (id, course_id, module_id, title, description, order_index, estimated_minutes)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    course_id = excluded.course_id,
    module_id = excluded.module_id,
    title = excluded.title,
    description = excluded.description,
    order_index = excluded.order_index,
    estimated_minutes = excluded.estimated_minutes
`).run(
  dbLessonJson.lesson.id,
  'course-databases-er',
  'mod-db-01',
  dbLessonJson.lesson.title,
  dbLessonJson.lesson.description,
  1,
  25
);

db.prepare(`
  INSERT INTO lesson_content (id, lesson_id, content, version)
  VALUES (?, ?, ?, 1)
  ON CONFLICT(lesson_id) DO UPDATE SET
    content = excluded.content
`).run(crypto.randomUUID(), dbLessonJson.lesson.id, JSON.stringify(dbLessonJson));

console.log('✅ Seeded interactive database lesson: Diseño ER: Biblioteca Universitaria');

// 6. Extract Lessons from docs/EJEMPLOS_JSON_VALIDADOS.md
const docPath = path.resolve(process.cwd(), '../docs/EJEMPLOS_JSON_VALIDADOS.md');
const altDocPath = path.resolve(process.cwd(), 'docs/EJEMPLOS_JSON_VALIDADOS.md');
const targetDoc = fs.existsSync(docPath) ? docPath : (fs.existsSync(altDocPath) ? altDocPath : null);

if (targetDoc) {
  const content = fs.readFileSync(targetDoc, 'utf8');
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
  let match;
  while ((match = jsonRegex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.lesson && parsed.lesson.id) {
        const l = parsed.lesson;
        let courseId = 'course-java-fundamentals';
        let moduleId: string | null = 'mod-java-01';

        if (l.id.includes('hello_world')) {
          courseId = 'course-intro-programming';
          moduleId = null;
        } else if (l.id.includes('oop')) {
          courseId = 'course-oop-java';
          moduleId = null;
        } else if (l.id.includes('arrays') || l.id.includes('loops') || l.id.includes('bucles')) {
          moduleId = 'mod-java-02';
        }

        db.prepare(`
          INSERT INTO lessons (id, course_id, module_id, title, description, order_index, estimated_minutes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            course_id = excluded.course_id,
            module_id = excluded.module_id,
            title = excluded.title,
            description = excluded.description,
            order_index = excluded.order_index,
            estimated_minutes = excluded.estimated_minutes
        `).run(l.id, courseId, moduleId, l.title, l.description || '', l.order || 1, l.estimatedMinutes || 15);

        db.prepare(`
          INSERT INTO lesson_content (id, lesson_id, content, version)
          VALUES (?, ?, ?, 1)
          ON CONFLICT(lesson_id) DO UPDATE SET
            content = excluded.content
        `).run(crypto.randomUUID(), l.id, JSON.stringify(parsed));

        console.log('✅ Seeded lesson:', l.title, '(' + l.blocks.length + ' blocks)');
      }
    } catch(e) {
      // ignore
    }
  }
}

// 7. Marketplace Listings
const marketplaceListings = [
  {
    id: 'market-course-01',
    courseId: 'course-java-fundamentals',
    creatorId: adminId,
    title: 'Masterclass: Java desde Cero hasta Backend',
    description: 'Curso completo y práctico con ejercicios interactivos, validaciones de código en tiempo real y certificación incluida.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    price: 0.0, // Gratis
    currency: 'USD',
    purchaseCount: 42,
    averageRating: 4.9,
  },
  {
    id: 'market-course-02',
    courseId: 'course-oop-java',
    creatorId: adminId,
    title: 'Arquitectura y POO Profesional',
    description: 'Aprende los principios SOLID, patrones de diseño de software y abstracción para entrevistas técnicas.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    price: 19.99,
    currency: 'USD',
    purchaseCount: 18,
    averageRating: 4.8,
  },
  {
    id: 'market-course-03',
    courseId: 'course-databases-er',
    creatorId: adminId,
    title: 'Modelado de Bases de Datos y Diagramas ER',
    description: 'Domina el diseño conceptual y lógico con el lienzo interactivo estilo Oracle Data Modeler.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80',
    price: 0.0, // Gratis
    currency: 'USD',
    purchaseCount: 65,
    averageRating: 5.0,
  }
];

for (const m of marketplaceListings) {
  db.prepare(`
    INSERT INTO marketplace_courses (id, course_id, creator_id, title, description, thumbnail_url, price, currency, purchase_count, average_rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(course_id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      thumbnail_url = excluded.thumbnail_url,
      price = excluded.price,
      currency = excluded.currency,
      purchase_count = excluded.purchase_count,
      average_rating = excluded.average_rating
  `).run(m.id, m.courseId, m.creatorId, m.title, m.description, m.thumbnailUrl, m.price, m.currency, m.purchaseCount, m.averageRating);
}

// 8. User course preference (En progreso para el estudiante)
db.prepare(`
  INSERT INTO user_course_preferences (id, user_id, course_id, status, notes)
  VALUES ('pref-002', ?, 'course-databases-er', 'in_progress', 'Practicar relaciones 1:N y tablas intermedias en el lienzo')
  ON CONFLICT(user_id, course_id) DO UPDATE SET
    status = excluded.status,
    notes = excluded.notes
`).run(studentId);

console.log('🎉 Full database seeding completed successfully!');
