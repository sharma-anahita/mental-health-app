import express from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { listGoals, createGoal, updateGoal } from '../controllers/goalController';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listGoals);
router.post('/', createGoal);
router.patch('/:id', updateGoal);

export default router;
