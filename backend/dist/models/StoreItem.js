"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const storeItemSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, index: true },
    description: { type: String },
    cost: { type: Number, required: true },
    type: { type: String, required: true, enum: ['cosmetic', 'utility'] },
    effect: { type: String },
    active: { type: Boolean, default: true },
}, { timestamps: true });
const StoreItem = mongoose_1.default.model('StoreItem', storeItemSchema);
exports.default = StoreItem;
