"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const preferencesController_1 = __importDefault(require("../controllers/preferencesController"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.default);
// GET  /api/user/preferences  — retrieve preferences (including theme)
router.get('/', preferencesController_1.default.getPreferences);
// PATCH /api/user/preferences  — update preferences (theme, etc.)
router.patch('/', preferencesController_1.default.updatePreferences);
exports.default = router;
