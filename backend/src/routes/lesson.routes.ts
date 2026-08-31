import { Router } from 'express';
import { LessonController } from '../controllers/lesson.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/:id', (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    authenticateToken(req, res, () => LessonController.getById(req, res));
  } else {
    LessonController.getById(req, res);
  }
});

router.post('/', authenticateToken, requireAdmin, LessonController.create);
router.delete('/:id', authenticateToken, requireAdmin, LessonController.delete);

export default router;
