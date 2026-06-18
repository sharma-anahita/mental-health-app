import express from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { listGoals, createGoal, updateGoal, deleteGoal, createFromRecommendation } from '../controllers/goalController';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listGoals);
router.post('/', createGoal);
router.post('/from-recommendation', createFromRecommendation);
router.patch('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;

