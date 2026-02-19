import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import gamificationController from '../controllers/gamificationController';

const router = Router();

router.use(authMiddleware);

router.get('/', gamificationController.gamification);

export default router;
