"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const goalController_1 = require("../controllers/goalController");
const router = express_1.default.Router();
router.use(authMiddleware_1.default);
router.get('/', goalController_1.listGoals);
router.post('/', goalController_1.createGoal);
router.post('/from-recommendation', goalController_1.createFromRecommendation);
router.patch('/:id', goalController_1.updateGoal);
router.delete('/:id', goalController_1.deleteGoal);
exports.default = router;
