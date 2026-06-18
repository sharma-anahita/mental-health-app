"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
/* ─────────────────────────────────────────────
   Schema
───────────────────────────────────────────── */
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    passwordHash: { type: String, required: true },
    googleId: { type: String, unique: true, sparse: true },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    streakBeforeBreak: { type: Number, default: 0 },
    streakBroken: { type: Boolean, default: false },
    streakBreakMissedDays: { type: Number, default: 0, min: 0 },
    streakRestoreUsedForGap: { type: Boolean, default: false },
    lastActiveDate: { type: Date, default: Date.now },
    coins: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    // ── Profile ──
    username: { type: String, unique: true, sparse: true },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    country: { type: String, default: '' },
    countryCode: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    fullNumber: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    profileCompletedFields: { type: [String], default: [] },
    profileCompletionRewardClaimed: { type: Boolean, default: false },
    // ── Inventory (store purchases) ──
    inventory: {
        type: [
            {
                itemId: {
                    type: mongoose_1.default.Schema.Types.ObjectId,
                    ref: 'StoreItem',
                    required: true,
                    index: true, // performance boost
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1,
                },
                acquiredAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        default: [],
    },
    // ── Preferences (theme, etc.) ──
    preferences: {
        type: {
            theme: {
                type: String,
                default: 'calm', // default theme
            },
            fontColor: {
                type: String,
                default: '#0f172a',
            },
            fontStyle: {
                type: String,
                default: 'Inter',
            },
        },
        default: () => ({ theme: 'calm', fontColor: '#0f172a', fontStyle: 'Inter' }),
    },
    // ── Password Reset ──
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
}, { timestamps: true });
/* ─────────────────────────────────────────────
   Model
───────────────────────────────────────────── */
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
