"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const chatController_1 = require("../controllers/chatController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.default);
router.post('/', chatController_1.chatWithAI);
exports.default = router;
