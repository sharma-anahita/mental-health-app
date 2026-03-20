"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reflectionController_1 = __importDefault(require("../controllers/reflectionController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const reflectionRoutes = (0, express_1.Router)();
// Apply auth middleware to all routes
reflectionRoutes.use(authMiddleware_1.default);
/**
 * POST /api/reflections
 * Create a reflection for today (or update if already exists)
 */
reflectionRoutes.post('/', reflectionController_1.default.createReflection);
/**
 * GET /api/reflections/today
 * Get reflection for today
 */
reflectionRoutes.get('/today', reflectionController_1.default.getReflectionToday);
/**
 * GET /api/reflections
 * Get all reflections (paginated)
 */
reflectionRoutes.get('/', reflectionController_1.default.getReflections);
exports.default = reflectionRoutes;
