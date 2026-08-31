import { Response } from 'express';
import fs from 'fs';
import crypto from 'crypto';
import { getDb, transaction } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { LessonJsonSchema } from '../schemas/lesson.schema';

export class UploadController {
  static async uploadJson(req: AuthRequest, res: Response) {
    const { courseId, lessonTitle } = req.body;
    const file = req.file;

    let jsonData: any;

    if (file) {
      try {
        const fileContent = fs.readFileSync(file.path, 'utf8');
        jsonData = JSON.parse(fileContent);
        fs.unlinkSync(file.path);
      } catch (err) {
        return res.status(400).json({ error: 'Invalid JSON file format' });
      }
    } else if (req.body.jsonContent) {
      try {
        jsonData = typeof req.body.jsonContent === 'string' ? JSON.parse(req.body.jsonContent) : req.body.jsonContent;
      } catch (err) {
        return res.status(400).json({ error: 'Invalid JSON string provided' });
      }
    } else {
      return res.status(400).json({ error: 'Either a JSON file or jsonContent is required' });
    }

    const validationResult = LessonJsonSchema.safeParse(jsonData);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid JSON schema',
        details: validationResult.error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const validatedData = validationResult.data;
    const db = getDb();

    let targetCourseId = courseId;
    if (!targetCourseId) {
      const defaultCourse = db.prepare('SELECT id FROM courses ORDER BY created_at ASC LIMIT 1').get() as any;
      if (defaultCourse) {
        targetCourseId = defaultCourse.id;
      } else {
        targetCourseId = crypto.randomUUID();
        db.prepare(
          'INSERT INTO courses (id, title, description, slug, created_by, is_published) VALUES (?, ?, ?, ?, ?, 1)'
        ).run(targetCourseId, 'Curso General', 'Curso creado automáticamente para lecciones subidas', 'curso-general', req.user!.id);
      }
    }

    const title = lessonTitle || validatedData.lesson.title || 'Nueva Lección';
    const lessonId = validatedData.lesson.id || crypto.randomUUID();
    const order = validatedData.lesson.order || 1;
    const estMin = validatedData.lesson.estimatedMinutes || 15;

    transaction(() => {
      const existingLesson = db.prepare('SELECT id FROM lessons WHERE id = ?').get(lessonId);
      if (existingLesson) {
        db.prepare(
          'UPDATE lessons SET title = ?, description = ?, order_index = ?, estimated_minutes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(title, validatedData.lesson.description || '', order, estMin, lessonId);

        db.prepare(
          'INSERT OR REPLACE INTO lesson_content (id, lesson_id, content, version, updated_at) VALUES ((SELECT id FROM lesson_content WHERE lesson_id = ?), ?, ?, 1, CURRENT_TIMESTAMP)'
        ).run(lessonId, lessonId, JSON.stringify(validatedData));
      } else {
        db.prepare(
          'INSERT INTO lessons (id, course_id, title, description, order_index, estimated_minutes) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(lessonId, targetCourseId, title, validatedData.lesson.description || '', order, estMin);

        db.prepare(
          'INSERT INTO lesson_content (id, lesson_id, content, version) VALUES (?, ?, ?, 1)'
        ).run(crypto.randomUUID(), lessonId, JSON.stringify(validatedData));
      }

      db.prepare(
        'INSERT INTO audit_log (id, user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(crypto.randomUUID(), req.user!.id, 'UPLOAD_JSON', 'LESSON', lessonId, JSON.stringify({ blocksCount: validatedData.lesson.blocks.length }));
    });

    res.status(201).json({
      id: lessonId,
      courseId: targetCourseId,
      title,
      validationStatus: 'success',
      blocksCount: validatedData.lesson.blocks.length,
      lesson: validatedData.lesson,
    });
  }

  static async uploadMedia(req: AuthRequest, res: Response) {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const file = req.file;
    const db = getDb();
    const id = crypto.randomUUID();
    const url = `/uploads/${file.filename}`;

    db.prepare(
      'INSERT INTO media (id, file_name, file_size, file_type, url, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, file.originalname, file.size, file.mimetype, url, req.user!.id);

    res.status(201).json({
      id,
      url,
      fileName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    });
  }
}
