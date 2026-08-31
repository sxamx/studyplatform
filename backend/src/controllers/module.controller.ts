import { Response } from 'express';
import crypto from 'crypto';
import { getDb, transaction } from '../database/db';
import { AuthRequest } from '../middleware/auth';

export class ModuleController {
  static async getByCourseId(req: AuthRequest, res: Response) {
    const { courseId } = req.params;
    const db = getDb();

    const modules = db.prepare(
      'SELECT m.*, (SELECT COUNT(*) FROM lessons WHERE module_id = m.id) as lessons_count FROM modules m WHERE m.course_id = ? ORDER BY m.order_index ASC'
    ).all(courseId) as any[];

    res.status(200).json({ modules });
  }

  static async create(req: AuthRequest, res: Response) {
    const { courseId, title, description, orderIndex, estimatedHours } = req.body;
    if (!courseId || !title) {
      return res.status(400).json({ error: 'courseId y title son obligatorios' });
    }

    const db = getDb();
    const id = crypto.randomUUID();

    db.prepare(
      'INSERT INTO modules (id, course_id, title, description, order_index, estimated_hours) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, courseId, title, description || '', orderIndex || 1, estimatedHours || 5);

    res.status(201).json({ id, courseId, title, description, orderIndex: orderIndex || 1, estimatedHours: estimatedHours || 5 });
  }

  static async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { title, description, orderIndex, estimatedHours } = req.body;
    const db = getDb();

    const existing = db.prepare('SELECT id FROM modules WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Módulo no encontrado' });

    db.prepare(
      'UPDATE modules SET title = COALESCE(?, title), description = COALESCE(?, description), order_index = COALESCE(?, order_index), estimated_hours = COALESCE(?, estimated_hours), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(title, description, orderIndex, estimatedHours, id);

    res.status(200).json({ message: 'Módulo actualizado con éxito' });
  }

  static async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const db = getDb();

    transaction(() => {
      // Disassociate lessons from this module (set module_id to null) or cascade
      db.prepare('UPDATE lessons SET module_id = NULL WHERE module_id = ?').run(id);
      db.prepare('DELETE FROM modules WHERE id = ?').run(id);
    });

    res.status(200).json({ message: 'Módulo eliminado con éxito' });
  }
}
