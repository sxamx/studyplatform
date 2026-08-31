import { Response } from 'express';
import crypto from 'crypto';
import { getDb } from '../database/db';
import { AuthRequest } from '../middleware/auth';

export class PreferenceController {
  static async getMyPreferences(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autorizado' });

    const db = getDb();
    const prefs = db.prepare(
      'SELECT ucp.*, c.title as course_title, c.description as course_description, c.thumbnail_url FROM user_course_preferences ucp JOIN courses c ON c.id = ucp.course_id WHERE ucp.user_id = ?'
    ).all(userId) as any[];

    res.status(200).json({ preferences: prefs });
  }

  static async setStatus(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autorizado' });

    const { courseId, status, notes } = req.body;
    if (!courseId || !status) {
      return res.status(400).json({ error: 'courseId y status son obligatorios' });
    }

    const validStatuses = ['in_progress', 'completed', 'archived', 'wishlisted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const db = getDb();
    const existing = db.prepare(
      'SELECT id FROM user_course_preferences WHERE user_id = ? AND course_id = ?'
    ).get(userId, courseId) as any;

    const archivedAt = status === 'archived' ? new Date().toISOString() : null;

    if (existing) {
      db.prepare(
        'UPDATE user_course_preferences SET status = ?, archived_at = COALESCE(?, archived_at), notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(status, archivedAt, notes, existing.id);
    } else {
      const id = crypto.randomUUID();
      db.prepare(
        'INSERT INTO user_course_preferences (id, user_id, course_id, status, archived_at, notes) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(id, userId, courseId, status, archivedAt, notes || '');
    }

    res.status(200).json({ message: 'Preferencia de curso guardada', status, courseId });
  }
}
