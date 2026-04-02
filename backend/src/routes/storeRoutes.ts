import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import storeController from '../controllers/storeController';

const router = Router();

router.use(authMiddleware);

router.get('/', storeController.getStoreItems);
router.post('/purchase', storeController.purchaseStoreItem);

export default router;
