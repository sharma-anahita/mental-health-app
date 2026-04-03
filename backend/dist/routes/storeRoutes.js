"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const storeController_1 = __importDefault(require("../controllers/storeController"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.default);
router.get('/', storeController_1.default.getStoreItems);
router.post('/purchase', storeController_1.default.purchaseStoreItem);
exports.default = router;
