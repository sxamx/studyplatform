import { Router } from 'express';
import { ModuleController } from '../controllers/module.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/course/:courseId', authenticateToken, ModuleController.getByCourseId);
router.post('/', authenticateToken, requireAdmin, ModuleController.create);
router.put('/:id', authenticateToken, requireAdmin, ModuleController.update);
router.delete('/:id', authenticateToken, requireAdmin, ModuleController.delete);

export default router;
