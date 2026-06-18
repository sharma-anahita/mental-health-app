"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const GoalSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['daily', 'weekly', 'recommended'], required: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    sourceRecommendationId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Recommendation', default: null },
    sourceActivityId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Activity', default: null },
}, { timestamps: { createdAt: true, updatedAt: false } });
// Index for querying goals by their generating recommendation snapshot
GoalSchema.index({ sourceRecommendationId: 1 });
exports.default = mongoose_1.default.model('Goal', GoalSchema);
