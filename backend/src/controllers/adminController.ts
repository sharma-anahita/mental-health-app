import { Request, Response, NextFunction } from 'express';
import { seedStoreItems } from '../scripts/seedStoreItems';

type AuthRequest = Request & { userId?: string };

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'default-admin-secret';

/**
 * POST /api/admin/seed-store
 * Requires: x-admin-secret header matching ADMIN_SECRET
 * Seeds/updates store items in the database
 */
export const seedStoreData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const adminSecret = req.headers['x-admin-secret'];
    
    if (adminSecret !== ADMIN_SECRET) {
      return res.status(403).json({ message: 'Unauthorized: Invalid admin secret' });
    }

    await seedStoreItems();
    res.json({ message: 'Store items seeded successfully' });
  } catch (err) {
    next(err);
  }
};

export default { seedStoreData };
