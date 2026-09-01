import { Response } from 'express';
import { getDb } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { getAuditLogs, clearAuditLogs } from '../middleware/auditLogger';

export class AdminController {
  static async getStats(req: AuthRequest, res: Response) {
    const db = getDb();

    const totalUsers = Number((db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c);
    const totalCourses = Number((db.prepare('SELECT COUNT(*) as c FROM courses').get() as any).c);
    const totalLessons = Number((db.prepare('SELECT COUNT(*) as c FROM lessons').get() as any).c);
    const completedProgress = Number((db.prepare('SELECT COUNT(*) as c FROM user_progress WHERE completed = 1').get() as any).c);

    const activeUsersRow = db.prepare(
      "SELECT COUNT(DISTINCT id) as c FROM users WHERE last_login_at >= datetime('now', '-7 days')"
    ).get() as any;
    const activeUsersThisWeek = Number(activeUsersRow?.c || totalUsers);

    const averageCompletionRate = totalUsers > 0 && totalLessons > 0
      ? Math.min(100, Math.round((completedProgress / (totalUsers * totalLessons)) * 100))
      : 0;

    res.status(200).json({
      totalUsers,
      totalCourses,
      totalLessons,
      activeUsersThisWeek,
      averageCompletionRate,
      completedLessonsTotal: completedProgress,
    });
  }

  static async getUsers(req: AuthRequest, res: Response) {
    const db = getDb();
    const users = db.prepare(
      'SELECT id, email, full_name, role, theme_preference, created_at, last_login_at, is_active, (SELECT COUNT(*) FROM user_progress WHERE user_id = users.id AND completed = 1) as completed_lessons FROM users ORDER BY created_at DESC'
    ).all() as any[];

    res.status(200).json({
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        themePreference: u.theme_preference,
        createdAt: u.created_at,
        lastLoginAt: u.last_login_at,
        isActive: Boolean(u.is_active),
        completedLessons: u.completed_lessons,
      })),
    });
  }

  static async updateUserRole(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { role, isActive } = req.body;
    const db = getDb();

    db.prepare(
      'UPDATE users SET role = COALESCE(?, role), is_active = COALESCE(?, is_active), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(role ?? null, isActive !== undefined ? (isActive ? 1 : 0) : null, id);

    res.status(200).json({ message: 'User updated successfully' });
  }

  static async getLogs(req: AuthRequest, res: Response) {
    const logs = getAuditLogs();
    // Return logs in reverse chronological order
    res.status(200).json({ logs: logs.slice().reverse() });
  }

  static async clearLogs(req: AuthRequest, res: Response) {
    clearAuditLogs();
    res.status(200).json({ message: 'Logs cleared successfully' });
  }
}
