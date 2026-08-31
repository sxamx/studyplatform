import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getDb } from './db';
import { config } from '../config/index';

console.log('🌱 Seeding database with tracks, modules, lessons and marketplace listings...');

const db = getDb();

// 1. Admin User
const adminEmail = config.adminEmail;
const adminSalt = bcrypt.genSaltSync(10);
const adminPassHash = bcrypt.hashSync(config.adminDefaultPassword, adminSalt);
const adminId = 'admin-user-0001';

db.prepare(
  'INSERT OR REPLACE INTO users (id, email, password_hash, full_name, role, theme_preference) VALUES (?, ?, ?, ?, ?, ?)'
).run(adminId, adminEmail, adminPassHash, 'Admin StudyPlatform', 'ADMIN', 'dark');

// 2. Student Demo User
const studentEmail = 'estudiante@studyplatform.com';
const studentSalt = bcrypt.genSaltSync(10);
const studentPassHash = bcrypt.hashSync('Student123456!', studentSalt);
const studentId = 'student-user-0001';

db.prepare(
  'INSERT OR REPLACE INTO users (id, email, password_hash, full_name, role, theme_preference) VALUES (?, ?, ?, ?, ?, ?)'
).run(studentId, studentEmail, studentPassHash, 'Estudiante Demo', 'USER', 'light');

// 3. Learning Tracks
const tracks = [
  {
    id: 'track-backend',
    title: 'Desarrollo Backend y Lenguajes Fuertemente Tipados',
    description: 'Aprende arquitectura, lógica robusta y programación moderna con Java, Python y C#.',
    slug: 'desarrollo-backend',
    icon: 'Terminal',
    orderIndex: 1,
  },
  {
    id: 'track-fundamentals',
    title: 'Fundamentos de Algoritmia y Lógica',
    description: 'Aprende a pensar como un ingeniero de software desde el primer día.',
    slug: 'fundamentos-de-algoritmia',
    icon: 'Sparkles',
    orderIndex: 2,
  },
];

for (const t of tracks) {
  db.prepare(`
    INSERT OR REPLACE INTO learning_tracks (id, title, description, slug, icon, order_index, is_published)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(t.id, t.title, t.description, t.slug, t.icon, t.orderIndex);
}

// 4. Courses
const courses = [
  {
    id: 'course-java-fundamentals',
    trackId: 'track-backend',
    title: 'Java para Principiantes',
    description: 'Aprende Java desde cero: variables, estructuras de control, bucles, arreglos y programación moderna.',
    slug: 'java-para-principiantes',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    orderIndex: 1,
  },
  {
    id: 'course-intro-programming',
    trackId: 'track-fundamentals',
    title: 'Introducción a la Programación',
    description: 'Fundamentos universales de lógica, algoritmos y tu primer programa.',
    slug: 'introduccion-a-la-programacion',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    orderIndex: 2,
  },
  {
    id: 'course-oop-java',
    trackId: 'track-backend',
    title: 'Programación Orientada a Objetos',
    description: 'Domina clases, objetos, constructores y métodos con ejemplos interactivos y visuales.',
    slug: 'programacion-orientada-a-objetos',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    orderIndex: 3,
  }
];

for (const c of courses) {
  db.prepare(`
    INSERT OR REPLACE INTO courses (id, track_id, title, description, slug, thumbnail_url, created_by, is_published, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).run(c.id, c.trackId, c.title, c.description, c.slug, c.thumbnailUrl, adminId, c.orderIndex);
}

// 5. Modules for course-java-fundamentals
const javaModules = [
  {
    id: 'mod-java-01',
    courseId: 'course-java-fundamentals',
    title: 'Módulo 1: Sintaxis y Tipos de Datos',
    description: 'Fundamentos de la sintaxis, tipos primitivos, variables e inmutabilidad de Strings.',
    orderIndex: 1,
    estimatedHours: 4,
  },
  {
    id: 'mod-java-02',
    courseId: 'course-java-fundamentals',
    title: 'Módulo 2: Estructuras de Control y Arreglos',
    description: 'Toma de decisiones, condicionales, bucles for/while y almacenamiento con Arrays.',
    orderIndex: 2,
    estimatedHours: 6,
  },
];

for (const m of javaModules) {
  db.prepare(`
    INSERT OR REPLACE INTO modules (id, course_id, title, description, order_index, estimated_hours)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(m.id, m.courseId, m.title, m.description, m.orderIndex, m.estimatedHours);
}

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
          INSERT OR REPLACE INTO lessons (id, course_id, module_id, title, description, order_index, estimated_minutes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(l.id, courseId, moduleId, l.title, l.description || '', l.order || 1, l.estimatedMinutes || 15);

        db.prepare(`
          INSERT OR REPLACE INTO lesson_content (id, lesson_id, content, version)
          VALUES (?, ?, ?, 1)
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
  }
];

for (const m of marketplaceListings) {
  db.prepare(`
    INSERT OR REPLACE INTO marketplace_courses (id, course_id, creator_id, title, description, thumbnail_url, price, currency, purchase_count, average_rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(m.id, m.courseId, m.creatorId, m.title, m.description, m.thumbnailUrl, m.price, m.currency, m.purchaseCount, m.averageRating);
}

// 8. User course preference (En progreso para el estudiante)
db.prepare(`
  INSERT OR REPLACE INTO user_course_preferences (id, user_id, course_id, status, notes)
  VALUES ('pref-001', ?, 'course-java-fundamentals', 'in_progress', 'Repasar especialmente el módulo 2 sobre arreglos y bucles')
`).run(studentId);

console.log('🎉 Full database seeding completed successfully!');
