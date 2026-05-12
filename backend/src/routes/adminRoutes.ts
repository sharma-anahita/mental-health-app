import { Router } from 'express';
import { seedStoreData } from '../controllers/adminController';

const router = Router();

// POST /api/admin/seed-store
// Requires x-admin-secret header
router.post('/seed-store', seedStoreData);

export default router;
