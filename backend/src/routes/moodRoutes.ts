import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { createMood, getMoods } from '../controllers/moodController';

const router = Router();

router.use(authMiddleware);

router.post('/', createMood);
router.get('/', getMoods);

export default router;
