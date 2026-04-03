"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.updateProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const progressionService_1 = __importDefault(require("../services/progressionService"));
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const allowedFields = ['username', 'bio', 'avatarUrl', 'country', 'countryCode', 'phoneNumber', 'fullNumber', 'phone', 'location'];
        const updates = req.body;
        const user = await User_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        user.profileCompletedFields = user.profileCompletedFields || [];
        // Determine which fields are newly filled in this update
        const newlyFilled = [];
        for (const field of allowedFields) {
            if (!(field in updates))
                continue;
            const newVal = updates[field];
            const prevVal = user[field];
            const prevEmpty = prevVal === undefined || prevVal === null || (typeof prevVal === 'string' && prevVal.trim() === '');
            const newFilled = newVal !== undefined && newVal !== null && !(typeof newVal === 'string' && newVal.trim() === '');
            // Apply the update
            user[field] = newVal;
            if (prevEmpty && newFilled)
                newlyFilled.push(field);
        }
        // Delegate XP awarding and persistence to progressionService
        let xpGained = 0;
        if (newlyFilled.length > 0) {
            const result = await progressionService_1.default.rewardProfileCompletion(user, newlyFilled);
            xpGained = result.xpGained;
        }
        else {
            await user.save();
        }
        // One-time completion bonus: award +5 coins when all profile fields are filled.
        const isFieldFilled = (value) => value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '');
        const allFieldsFilled = allowedFields.every((field) => isFieldFilled(user[field]));
        let coinBonus = 0;
        if (allFieldsFilled && !user.profileCompletionRewardClaimed) {
            user.coins = (user.coins || 0) + 5;
            user.profileCompletionRewardClaimed = true;
            coinBonus = 5;
            await user.save();
        }
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                bio: user.bio,
                avatarUrl: user.avatarUrl,
                country: user.country,
                countryCode: user.countryCode,
                phoneNumber: user.phoneNumber,
                fullNumber: user.fullNumber,
                phone: user.phone,
                location: user.location,
                xp: user.xp,
                profileCompletedFields: user.profileCompletedFields,
                streak: user.streak,
                coins: user.coins,
                level: user.level,
            },
            xpGained,
            coinBonus,
        });
    }
    catch (err) {
        // handle duplicate username index error gracefully
        if (err && err.code === 11000) {
            return res.status(409).json({ message: 'Duplicate value', detail: err.message });
        }
        next(err);
    }
};
exports.updateProfile = updateProfile;
const getProfile = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const user = await User_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                bio: user.bio,
                avatarUrl: user.avatarUrl,
                country: user.country,
                countryCode: user.countryCode,
                phoneNumber: user.phoneNumber,
                fullNumber: user.fullNumber,
                phone: user.phone,
                location: user.location,
                xp: user.xp,
                profileCompletedFields: user.profileCompletedFields,
                streak: user.streak,
                coins: user.coins,
                level: user.level,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getProfile = getProfile;
exports.default = { updateProfile: exports.updateProfile, getProfile: exports.getProfile };
