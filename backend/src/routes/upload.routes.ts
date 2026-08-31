import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/json', authenticateToken, requireAdmin, upload.single('jsonFile'), UploadController.uploadJson);
router.post('/image', authenticateToken, requireAdmin, upload.single('image'), UploadController.uploadMedia);
router.post('/video', authenticateToken, requireAdmin, upload.single('video'), UploadController.uploadMedia);

export default router;
