import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import {
  getRecommendations,
  getRecommendedActivities,
  getRecommendedQuestions,
  recordFeedback
} from '../controllers/recommendationController';

const router = Router();

// Secure all recommendation routes
router.use(authMiddleware);

router.get('/', getRecommendations);
router.get('/activities', getRecommendedActivities);
router.get('/questions', getRecommendedQuestions);
router.post('/feedback', recordFeedback);

export default router;
