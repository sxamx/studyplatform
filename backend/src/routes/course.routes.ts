import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    authenticateToken(req, res, () => CourseController.getAll(req, res));
  } else {
    CourseController.getAll(req, res);
  }
});

router.get('/:id', (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    authenticateToken(req, res, () => CourseController.getById(req, res));
  } else {
    CourseController.getById(req, res);
  }
});

router.post('/', authenticateToken, requireAdmin, CourseController.create);
router.put('/:id', authenticateToken, requireAdmin, CourseController.update);
router.delete('/:id', authenticateToken, requireAdmin, CourseController.delete);

export default router;
