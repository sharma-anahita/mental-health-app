"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// POST /api/admin/seed-store
// Requires x-admin-secret header
router.post('/seed-store', adminController_1.seedStoreData);
exports.default = router;
