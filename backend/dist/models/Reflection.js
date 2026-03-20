"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const reflectionSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    date: { type: Date, required: true, default: () => new Date() },
    sentiment: {
        score: { type: Number },
        label: { type: String },
    },
}, { timestamps: true });
// Index for efficient queries by userId and date
reflectionSchema.index({ userId: 1, date: -1 });
const Reflection = mongoose_1.default.model('Reflection', reflectionSchema);
exports.default = Reflection;
