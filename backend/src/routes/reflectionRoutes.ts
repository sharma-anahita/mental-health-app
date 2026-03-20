import { Router } from 'express';
import reflectionController from '../controllers/reflectionController';
import authMiddleware from '../middleware/authMiddleware';

const reflectionRoutes = Router();

// Apply auth middleware to all routes
reflectionRoutes.use(authMiddleware);

/**
 * POST /api/reflections
 * Create a reflection for today (or update if already exists)
 */
reflectionRoutes.post('/', reflectionController.createReflection);

/**
 * GET /api/reflections/today
 * Get reflection for today
 */
reflectionRoutes.get('/today', reflectionController.getReflectionToday);

/**
 * GET /api/reflections
 * Get all reflections (paginated)
 */
reflectionRoutes.get('/', reflectionController.getReflections);

export default reflectionRoutes;
