"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const moodController_1 = require("../controllers/moodController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.default);
router.post('/', moodController_1.createMood);
router.get('/', moodController_1.getMoods);
exports.default = router;
