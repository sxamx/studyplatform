import { Router } from 'express';
import { PreferenceController } from '../controllers/preference.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/my', authenticateToken, PreferenceController.getMyPreferences);
router.post('/status', authenticateToken, PreferenceController.setStatus);

export default router;
