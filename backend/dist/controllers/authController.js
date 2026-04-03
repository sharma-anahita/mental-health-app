"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.login = exports.register = void 0;
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const User_1 = __importDefault(require("../models/User"));
const SALT_ROUNDS = 10;
function getJwtSecret() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
        throw new Error('JWT_SECRET not set');
    return jwtSecret;
}
function buildUserResponse(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        streak: user.streak,
    };
}
function signToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, getJwtSecret(), { expiresIn: '7d' });
}
function startOfUtcDay(d) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function dayDiffFromToday(lastDate, now = new Date()) {
    const today = startOfUtcDay(now);
    const last = startOfUtcDay(lastDate);
    return Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}
async function updateStreakStatusOnLogin(user) {
    const now = new Date();
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (!lastActive) {
        user.lastActiveDate = now;
        user.streakBroken = false;
        await user.save();
        return;
    }
    const daysAgo = dayDiffFromToday(lastActive, now);
    // Same-day login: no streak state change needed.
    if (daysAgo <= 0) {
        return;
    }
    // Keep an existing unresolved break intact (one restore attempt per gap).
    if (user.streakBroken) {
        user.lastActiveDate = now;
        await user.save();
        return;
    }
    // Yesterday login: streak continuity is intact.
    if (daysAgo === 1) {
        user.lastActiveDate = now;
        await user.save();
        return;
    }
    // More than one day gap: streak is broken and can be restored with a ticket.
    if ((user.streak || 0) > 0) {
        user.streakBeforeBreak = user.streak;
        user.streak = 0;
        user.streakBroken = true;
        user.streakBreakMissedDays = Math.max(1, daysAgo - 1);
        user.streakRestoreUsedForGap = false;
    }
    user.lastActiveDate = now;
    await user.save();
}
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'name, email and password are required' });
        }
        const existing = await User_1.default.findOne({ email });
        if (existing)
            return res.status(409).json({ message: 'Email already in use' });
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await User_1.default.create({ name, email, passwordHash, googleId: undefined });
        const token = signToken(user._id.toString());
        res.status(201).json({ token, user: buildUserResponse(user) });
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'email and password required' });
        const user = await User_1.default.findOne({ email });
        if (!user)
            return res.status(401).json({ message: 'Invalid credentials' });
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match)
            return res.status(401).json({ message: 'Invalid credentials' });
        await updateStreakStatusOnLogin(user);
        const token = signToken(user._id.toString());
        res.json({ token, user: buildUserResponse(user) });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const googleLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        if (!idToken)
            return res.status(400).json({ message: 'idToken is required' });
        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        if (!googleClientId)
            throw new Error('GOOGLE_CLIENT_ID not set');
        const client = new google_auth_library_1.OAuth2Client(googleClientId);
        const ticket = await client.verifyIdToken({
            idToken,
            audience: googleClientId,
        });
        const payload = ticket.getPayload();
        const email = payload?.email;
        const emailVerified = payload?.email_verified;
        const googleId = payload?.sub;
        const name = payload?.name || payload?.given_name || email?.split('@')[0] || 'Google User';
        if (!payload || !email || !googleId || !emailVerified) {
            return res.status(401).json({ message: 'Google account could not be verified' });
        }
        let user = await User_1.default.findOne({ email });
        if (!user) {
            const passwordHash = await bcrypt.hash((0, crypto_1.randomBytes)(32).toString('hex'), SALT_ROUNDS);
            user = await User_1.default.create({
                name,
                email,
                passwordHash,
                googleId,
            });
        }
        else if (!user.googleId) {
            user.googleId = googleId;
            if (!user.name && name)
                user.name = name;
            await user.save();
        }
        await updateStreakStatusOnLogin(user);
        const token = signToken(user._id.toString());
        return res.json({ token, user: buildUserResponse(user) });
    }
    catch (err) {
        next(err);
    }
};
exports.googleLogin = googleLogin;
exports.default = { register: exports.register, login: exports.login, googleLogin: exports.googleLogin };
