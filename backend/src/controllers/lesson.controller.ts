import { Response } from 'express';
import crypto from 'crypto';
import { getDb, transaction } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { LessonJsonSchema } from '../schemas/lesson.schema';

export class LessonController {
  static async getById(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const db = getDb();
    const userId = req.user?.id;

    const lesson = db.prepare(
      'SELECT l.*, c.title as course_title, lc.content as json_content FROM lessons l JOIN courses c ON c.id = l.course_id LEFT JOIN lesson_content lc ON lc.lesson_id = l.id WHERE l.id = ?'
    ).get(id) as any;

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    let parsedContent = null;
    if (lesson.json_content) {
      try {
        parsedContent = JSON.parse(lesson.json_content);
      } catch (e) {
        parsedContent = null;
      }
    }

    const prevLesson = db.prepare(
      'SELECT id, title FROM lessons WHERE course_id = ? AND order_index < ? ORDER BY order_index DESC LIMIT 1'
    ).get(lesson.course_id, lesson.order_index) as any;

    const nextLesson = db.prepare(
      'SELECT id, title FROM lessons WHERE course_id = ? AND order_index > ? ORDER BY order_index ASC LIMIT 1'
    ).get(lesson.course_id, lesson.order_index) as any;

    let progress = null;
    if (userId) {
      const prog = db.prepare('SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?').get(userId, id) as any;
      if (prog) {
        progress = {
          completed: Boolean(prog.completed),
          completedAt: prog.completed_at,
          score: prog.score,
          answers: prog.answers ? JSON.parse(prog.answers) : {},
        };
      }
    }

    res.status(200).json({
      id: lesson.id,
      courseId: lesson.course_id,
      courseTitle: lesson.course_title,
      title: lesson.title,
      description: lesson.description,
      order: lesson.order_index,
      estimatedMinutes: lesson.estimated_minutes,
      content: parsedContent,
      progress,
      nav: {
        prev: prevLesson || null,
        next: nextLesson || null,
      },
    });
  }

  static async create(req: AuthRequest, res: Response) {
    const { courseId, title, description, orderIndex, estimatedMinutes, content } = req.body;
    if (!courseId || !title) {
      return res.status(400).json({ error: 'courseId and title are required' });
    }

    const db = getDb();
    const lessonId = crypto.randomUUID();

    let contentToSave = content;
    if (content) {
      LessonJsonSchema.parse(content);
    }

    transaction(() => {
      db.prepare(
        'INSERT INTO lessons (id, course_id, title, description, order_index, estimated_minutes) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(lessonId, courseId, title, description || '', orderIndex || 1, estimatedMinutes || 15);

      if (contentToSave) {
        db.prepare(
          'INSERT INTO lesson_content (id, lesson_id, content, version) VALUES (?, ?, ?, 1)'
        ).run(crypto.randomUUID(), lessonId, JSON.stringify(contentToSave));
      }
    });

    res.status(201).json({ id: lessonId, title, courseId });
  }

  static async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const db = getDb();
    db.prepare('DELETE FROM lessons WHERE id = ?').run(id);
    res.status(200).json({ message: 'Lesson deleted successfully' });
  }
}
