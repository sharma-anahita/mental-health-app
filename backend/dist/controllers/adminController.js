"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedStoreData = void 0;
const seedStoreItems_1 = require("../scripts/seedStoreItems");
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'default-admin-secret';
/**
 * POST /api/admin/seed-store
 * Requires: x-admin-secret header matching ADMIN_SECRET
 * Seeds/updates store items in the database
 */
const seedStoreData = async (req, res, next) => {
    try {
        const adminSecret = req.headers['x-admin-secret'];
        if (adminSecret !== ADMIN_SECRET) {
            return res.status(403).json({ message: 'Unauthorized: Invalid admin secret' });
        }
        await (0, seedStoreItems_1.seedStoreItems)();
        res.json({ message: 'Store items seeded successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.seedStoreData = seedStoreData;
exports.default = { seedStoreData: exports.seedStoreData };
