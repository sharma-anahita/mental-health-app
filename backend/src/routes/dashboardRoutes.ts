import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import dashboardController from '../controllers/dashboardController';

const router = Router();

router.use(authMiddleware);

router.get('/heatmap', dashboardController.getHeatmapData);

export default router;
