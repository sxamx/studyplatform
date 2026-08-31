import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplace.controller';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/courses', optionalAuth, MarketplaceController.getAll);
router.get('/courses/:id', optionalAuth, MarketplaceController.getById);
router.post('/courses', authenticateToken, requireAdmin, MarketplaceController.createListing);
router.post('/courses/:id/buy', authenticateToken, MarketplaceController.buyCourse);
router.post('/courses/:id/reviews', authenticateToken, MarketplaceController.addReview);
router.get('/my-purchases', authenticateToken, MarketplaceController.getMyPurchases);

export default router;
