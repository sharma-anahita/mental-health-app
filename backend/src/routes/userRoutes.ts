import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import userController from '../controllers/userController';

const router = Router();

router.use(authMiddleware);

// PATCH /api/user/profile
router.patch('/profile', userController.updateProfile);

export default router;
