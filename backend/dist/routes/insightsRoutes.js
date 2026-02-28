"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const insightsController_1 = __importDefault(require("../controllers/insightsController"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.default);
router.get('/', insightsController_1.default.getInsights);
exports.default = router;
