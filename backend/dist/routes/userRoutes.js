"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const userController_1 = __importDefault(require("../controllers/userController"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.default);
// GET /api/user/profile
router.get('/profile', userController_1.default.getProfile);
// PATCH /api/user/profile
router.patch('/profile', userController_1.default.updateProfile);
exports.default = router;
