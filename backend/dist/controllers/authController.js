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
exports.resetPassword = exports.forgotPassword = exports.googleLogin = exports.login = exports.register = void 0;
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const User_1 = __importDefault(require("../models/User"));
const mailer_1 = __importDefault(require("../config/mailer"));
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
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function isValidPassword(password) {
    return password.length >= 8;
}
function generateResetToken() {
    return (0, crypto_1.randomBytes)(32).toString('hex');
}
function hashToken(token) {
    return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
}
async function sendResetEmail(email, resetToken) {
    const resetLink = `https://mental-health-app-ebon.vercel.app/reset-password/${resetToken}`;
    const emailFrom = process.env.EMAIL_FROM || 'noreply@mental-health-app.com';
    const mailOptions = {
        from: emailFrom,
        to: email,
        subject: 'Password Reset',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your Mental Health App account.</p>
        <p>Click the button below to reset your password. This link will expire in 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          If you didn't request a password reset, you can ignore this email. Your account is secure.
        </p>
        <p style="color: #666; font-size: 12px;">
          This is an automated email, please do not reply.
        </p>
      </div>
    `,
    };
    try {
        await mailer_1.default.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
    }
    catch (error) {
        console.error(`Failed to send reset email to ${email}:`, error);
        throw new Error('Failed to send password reset email');
    }
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
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }
        if (!isValidPassword(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
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
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }
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
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }
        const user = await User_1.default.findOne({ email });
        // Security: Always return the same response regardless of whether user exists
        // to prevent email enumeration attacks
        if (!user) {
            return res.status(200).json({ message: 'If an account exists with this email, a password reset link has been sent' });
        }
        // Generate reset token and hash it
        const resetToken = generateResetToken();
        const hashedToken = hashToken(resetToken);
        // Set token and expiry (10 minutes from now)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        // Send email with raw token (not hashed)
        await sendResetEmail(email, resetToken);
        res.status(200).json({ message: 'If an account exists with this email, a password reset link has been sent' });
    }
    catch (err) {
        next(err);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }
        if (!isValidPassword(newPassword)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        // Hash the provided token to compare with stored hash
        const hashedToken = hashToken(token);
        const user = await User_1.default.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }, // Token must not be expired
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid or expired reset token' });
        }
        // Update password and clear reset token
        user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({ message: 'Password has been reset successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.resetPassword = resetPassword;
exports.default = { register: exports.register, login: exports.login, googleLogin: exports.googleLogin, forgotPassword: exports.forgotPassword, resetPassword: exports.resetPassword };
