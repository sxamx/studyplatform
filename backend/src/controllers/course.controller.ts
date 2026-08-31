import { Response } from 'express';
import crypto from 'crypto';
import { getDb } from '../database/db';
import { AuthRequest } from '../middleware/auth';

export class CourseController {
  static async getAll(req: AuthRequest, res: Response) {
    const db = getDb();
    const userId = req.user?.id;

    const courses = db.prepare(
      "SELECT c.*, (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons, (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as total_modules FROM courses c WHERE c.is_published = 1 OR ? = 'ADMIN' ORDER BY c.order_index ASC, c.created_at DESC"
    ).all(req.user?.role || 'USER') as any[];

    const enhancedCourses = courses.map(course => {
      let completedLessons = 0;
      let preferenceStatus = 'in_progress';
      let preferenceNotes = '';

      if (userId) {
        const prog = db.prepare(
          'SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND course_id = ? AND completed = 1'
        ).get(userId, course.id) as any;
        completedLessons = prog ? Number(prog.count) : 0;

        const pref = db.prepare(
          'SELECT status, notes FROM user_course_preferences WHERE user_id = ? AND course_id = ?'
        ).get(userId, course.id) as any;
        if (pref) {
          preferenceStatus = pref.status;
          preferenceNotes = pref.notes || '';
        }
      }

      const total = Number(course.total_lessons || 0);
      const progressPercent = total > 0 ? Math.round((completedLessons / total) * 100) : 0;

      return {
        id: course.id,
        trackId: course.track_id,
        title: course.title,
        description: course.description,
        slug: course.slug,
        thumbnailUrl: course.thumbnail_url,
        isPublished: Boolean(course.is_published),
        totalLessons: total,
        totalModules: Number(course.total_modules || 0),
        completedLessons,
        progressPercent,
        preferenceStatus,
        preferenceNotes,
        createdAt: course.created_at,
      };
    });

    res.status(200).json({ courses: enhancedCourses, total: enhancedCourses.length });
  }

  static async getById(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const db = getDb();
    const userId = req.user?.id || '';

    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id) as any;
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const rawLessons = db.prepare(
      'SELECT l.*, lc.version, (SELECT completed FROM user_progress WHERE user_id = ? AND lesson_id = l.id) as is_completed, (SELECT score FROM user_progress WHERE user_id = ? AND lesson_id = l.id) as user_score FROM lessons l LEFT JOIN lesson_content lc ON lc.lesson_id = l.id WHERE l.course_id = ? ORDER BY l.order_index ASC'
    ).all(userId, userId, id) as any[];

    const modules = db.prepare(
      'SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC'
    ).all(id) as any[];

    const lessonsList = rawLessons.map(l => ({
      id: l.id,
      moduleId: l.module_id,
      title: l.title,
      description: l.description,
      order: l.order_index,
      estimatedMinutes: l.estimated_minutes,
      isCompleted: Boolean(l.is_completed),
      score: l.user_score || 0,
    }));

    const modulesWithLessons = modules.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      order: m.order_index,
      estimatedHours: m.estimated_hours,
      lessons: lessonsList.filter(l => l.moduleId === m.id),
    }));

    const totalLessons = lessonsList.length;
    const completedCount = lessonsList.filter(l => l.isCompleted).length;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    res.status(200).json({
      id: course.id,
      trackId: course.track_id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnail_url,
      isPublished: Boolean(course.is_published),
      totalLessons,
      completedLessons: completedCount,
      progressPercent,
      modules: modulesWithLessons,
      lessons: lessonsList,
    });
  }

  static async create(req: AuthRequest, res: Response) {
    const { title, description, isPublished, orderIndex, trackId, thumbnailUrl } = req.body;
    if (!title) return res.status(400).json({ error: 'Course title is required' });

    const db = getDb();
    const id = crypto.randomUUID();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    db.prepare(
      'INSERT INTO courses (id, track_id, title, description, slug, thumbnail_url, created_by, is_published, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, trackId || null, title, description || '', slug, thumbnailUrl || '', req.user!.id, isPublished !== false ? 1 : 0, orderIndex || 0);

    res.status(201).json({ id, title, description, slug, isPublished: isPublished !== false });
  }

  static async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { title, description, isPublished, orderIndex, trackId, thumbnailUrl } = req.body;
    const db = getDb();

    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    db.prepare(
      'UPDATE courses SET title = COALESCE(?, title), description = COALESCE(?, description), track_id = COALESCE(?, track_id), thumbnail_url = COALESCE(?, thumbnail_url), is_published = COALESCE(?, is_published), order_index = COALESCE(?, order_index), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(title, description, trackId, thumbnailUrl, isPublished !== undefined ? (isPublished ? 1 : 0) : null, orderIndex, id);

    res.status(200).json({ id, title, message: 'Course updated successfully' });
  }

  static async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const db = getDb();
    db.prepare('DELETE FROM courses WHERE id = ?').run(id);
    res.status(200).json({ message: 'Course deleted successfully' });
  }
}
