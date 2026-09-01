import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticateToken, requireAdmin, AdminController.getStats);
router.get('/users', authenticateToken, requireAdmin, AdminController.getUsers);
router.patch('/users/:id', authenticateToken, requireAdmin, AdminController.updateUserRole);
router.get('/logs', authenticateToken, requireAdmin, AdminController.getLogs);
router.post('/logs/clear', authenticateToken, requireAdmin, AdminController.clearLogs);

export default router;
