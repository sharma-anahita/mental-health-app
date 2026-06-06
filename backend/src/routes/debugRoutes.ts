import { Router } from 'express';
import debugController from '../controllers/debugController';

const router = Router();

router.get('/cache-stats', debugController.getCacheStats);

export default router;
