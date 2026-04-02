import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import gamificationController from '../controllers/gamificationController';

const router = Router();

router.use(authMiddleware);
router.post('/restore', gamificationController.restoreStreak);

export default router;
