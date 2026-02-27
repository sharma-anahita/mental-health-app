import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import insightsController from '../controllers/insightsController';

const router = Router();

router.use(authMiddleware);

router.get('/', insightsController.getInsights);

export default router;
