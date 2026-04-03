import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { chatWithAI } from '../controllers/chatController';

const router = Router();

router.use(authMiddleware);
router.post('/', chatWithAI);

export default router;
