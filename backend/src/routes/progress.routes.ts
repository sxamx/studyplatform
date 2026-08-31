import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, ProgressController.recordProgress);
router.get('/', authenticateToken, ProgressController.getProgress);

export default router;
