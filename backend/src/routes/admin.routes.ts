import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticateToken, requireAdmin, AdminController.getStats);
router.get('/users', authenticateToken, requireAdmin, AdminController.getUsers);
router.patch('/users/:id', authenticateToken, requireAdmin, AdminController.updateUserRole);

export default router;
