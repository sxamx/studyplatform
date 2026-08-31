import { Response } from 'express';
import crypto from 'crypto';
import { getDb } from '../database/db';
import { AuthRequest } from '../middleware/auth';

export class ProgressController {
  static async recordProgress(req: AuthRequest, res: Response) {
    const { lessonId, answers, score } = req.body;
    const userId = req.user?.id;

    if (!userId || !lessonId) {
      return res.status(400).json({ error: 'lessonId is required' });
    }

    const db = getDb();
    const lesson = db.prepare('SELECT course_id FROM lessons WHERE id = ?').get(lessonId) as any;
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const existing = db.prepare('SELECT id FROM user_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lessonId) as any;
    const answersJson = answers ? JSON.stringify(answers) : null;
    const finalScore = score !== undefined ? score : 100;
    const now = new Date().toISOString();

    if (existing) {
      db.prepare(
        'UPDATE user_progress SET completed = 1, completed_at = ?, answers = COALESCE(?, answers), score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(now, answersJson, finalScore, existing.id);
    } else {
      db.prepare(
        'INSERT INTO user_progress (id, user_id, lesson_id, course_id, completed, completed_at, answers, score) VALUES (?, ?, ?, ?, 1, ?, ?, ?)'
      ).run(crypto.randomUUID(), userId, lessonId, lesson.course_id, now, answersJson, finalScore);
    }

    res.status(200).json({
      lessonId,
      courseId: lesson.course_id,
      completed: true,
      completedAt: now,
      score: finalScore,
    });
  }

  static async getProgress(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const db = getDb();
    const progressList = db.prepare(
      'SELECT up.*, l.title as lesson_title, c.title as course_title FROM user_progress up JOIN lessons l ON l.id = up.lesson_id JOIN courses c ON c.id = up.course_id WHERE up.user_id = ? ORDER BY up.completed_at DESC'
    ).all(userId) as any[];

    res.status(200).json({
      progress: progressList.map(p => ({
        lessonId: p.lesson_id,
        lessonTitle: p.lesson_title,
        courseId: p.course_id,
        courseTitle: p.course_title,
        completed: Boolean(p.completed),
        completedAt: p.completed_at,
        score: p.score,
      })),
    });
  }
}
