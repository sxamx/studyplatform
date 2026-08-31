import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getDb } from './db';
import { config } from '../config/index';

console.log('🌱 Seeding database with validated lessons from EJEMPLOS_JSON_VALIDADOS.md...');

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

// 3. Courses
const courses = [
  {
    id: 'course-java-fundamentals',
    title: 'Java para Principiantes',
    description: 'Aprende Java desde cero: variables, estructuras de control, bucles, arreglos y programación moderna.',
    slug: 'java-para-principiantes',
    orderIndex: 1,
  },
  {
    id: 'course-intro-programming',
    title: 'Introducción a la Programación',
    description: 'Fundamentos universales de lógica, algoritmos y tu primer programa.',
    slug: 'introduccion-a-la-programacion',
    orderIndex: 2,
  },
  {
    id: 'course-oop-java',
    title: 'Programación Orientada a Objetos',
    description: 'Domina clases, objetos, constructores y métodos con ejemplos interactivos y visuales.',
    slug: 'programacion-orientada-a-objetos',
    orderIndex: 3,
  }
];

for (const c of courses) {
  db.prepare(
    'INSERT OR REPLACE INTO courses (id, title, description, slug, created_by, is_published, order_index) VALUES (?, ?, ?, ?, ?, 1, ?)'
  ).run(c.id, c.title, c.description, c.slug, adminId, c.orderIndex);
}

// 4. Extract Lessons from docs/EJEMPLOS_JSON_VALIDADOS.md
const docPath = path.resolve(process.cwd(), '../docs/EJEMPLOS_JSON_VALIDADOS.md');
const altDocPath = path.resolve(process.cwd(), 'docs/EJEMPLOS_JSON_VALIDADOS.md');
const targetDoc = fs.existsSync(docPath) ? docPath : (fs.existsSync(altDocPath) ? altDocPath : null);

if (targetDoc) {
  const content = fs.readFileSync(targetDoc, 'utf8');
  const jsonRegex = /`json\s*([\s\S]*?)\s*`/g;
  let match;
  while ((match = jsonRegex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.lesson && parsed.lesson.id) {
        const l = parsed.lesson;
        let courseId = 'course-java-fundamentals';
        if (l.id.includes('hello_world')) {
          courseId = 'course-intro-programming';
        } else if (l.id.includes('oop')) {
          courseId = 'course-oop-java';
        }

        db.prepare(
          'INSERT OR REPLACE INTO lessons (id, course_id, title, description, order_index, estimated_minutes) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(l.id, courseId, l.title, l.description || '', l.order || 1, l.estimatedMinutes || 15);

        db.prepare(
          'INSERT OR REPLACE INTO lesson_content (id, lesson_id, content, version) VALUES (?, ?, ?, 1)'
        ).run(crypto.randomUUID(), l.id, JSON.stringify(parsed));

        console.log('✅ Seeded lesson:', l.title, '(' + l.blocks.length + ' blocks)');
      }
    } catch(e) {
      // ignore
    }
  }
}

console.log('🎉 Seeding completed successfully!');
