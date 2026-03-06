import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import preferencesController from '../controllers/preferencesController';

const router = Router();

router.use(authMiddleware);

// GET  /api/user/preferences  — retrieve preferences (including theme)
router.get('/', preferencesController.getPreferences);

// PATCH /api/user/preferences  — update preferences (theme, etc.)
router.patch('/', preferencesController.updatePreferences);

export default router;