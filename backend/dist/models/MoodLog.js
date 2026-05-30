"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const moodLogSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    mood: { type: String, required: true },
    note: { type: String },
    energy: { type: Number, min: 1, max: 100 },
    stress: { type: Number, min: 1, max: 100 },
}, { timestamps: true });
const MoodLog = mongoose_1.default.model('MoodLog', moodLogSchema);
exports.default = MoodLog;
