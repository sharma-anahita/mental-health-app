"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    // Optional profile fields
    username: { type: String, unique: true, sparse: true },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    profileCompletedFields: { type: [String], default: [] },
    inventory: {
        type: [
            {
                itemId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'StoreItem', required: true },
                acquiredAt: { type: Date, default: Date.now },
            },
        ],
        default: [],
    },
}, { timestamps: true });
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
