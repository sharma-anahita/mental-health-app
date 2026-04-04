import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User, { IUser } from '../models/User';
import transporter from '../config/mailer';

const SALT_ROUNDS = 10;

type AuthRequest = Request & { userId?: string };

type AuthUserResponse = {
  id: unknown;
  name: string;
  email: string;
  xp: number;
  streak: number;
};

function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET not set');
  return jwtSecret;
}

function buildUserResponse(user: Pick<IUser, 'name' | 'email' | 'xp' | 'streak'> & { _id: unknown }): AuthUserResponse {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    xp: user.xp,
    streak: user.streak,
  };
}

function signToken(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: '7d' });
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

async function sendResetEmail(email: string, resetToken: string): Promise<void> {
  const resetLink = `https://mental-health-app-ebon.vercel.app/reset-password/${resetToken}`;
  const emailFrom = process.env.EMAIL_FROM || 'noreply@mental-health-app.com';

  const mailOptions = {
    from: emailFrom,
    to: email,
    subject: 'Password Reset Request - Mental Health App',
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
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send reset email to ${email}:`, error);
    throw new Error('Failed to send password reset email');
  }
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function dayDiffFromToday(lastDate: Date, now = new Date()): number {
  const today = startOfUtcDay(now);
  const last = startOfUtcDay(lastDate);
  return Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

async function updateStreakStatusOnLogin(user: any): Promise<void> {
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

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash, googleId: undefined } as Partial<IUser>);
    const token = signToken(user._id.toString());

    res.status(201).json({ token, user: buildUserResponse(user) });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    await updateStreakStatusOnLogin(user);

    const token = signToken(user._id.toString());

    res.json({ token, user: buildUserResponse(user) });
  } catch (err) {
    next(err);
  }
};

export const googleLogin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body as { idToken?: string };
    if (!idToken) return res.status(400).json({ message: 'idToken is required' });

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) throw new Error('GOOGLE_CLIENT_ID not set');

    const client = new OAuth2Client(googleClientId);
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

    let user = await User.findOne({ email });

    if (!user) {
      const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), SALT_ROUNDS);
      user = await User.create({
        name,
        email,
        passwordHash,
        googleId,
      } as Partial<IUser>);
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.name && name) user.name = name;
      await user.save();
    }

    await updateStreakStatusOnLogin(user);

    const token = signToken(user._id.toString());

    return res.json({ token, user: buildUserResponse(user) });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const user = await User.findOne({ email });
    
    // Security: Always return the same response regardless of whether user exists
    // to prevent email enumeration attacks
    if (!user) {
      return res.status(200).json({ message: 'If an account exists with this email, a password reset link has been sent' });
    }

    // Generate reset token and hash it
    const resetToken = generateResetToken();
    const hashedToken = hashToken(resetToken);

    // Set token and expiry (10 minutes from now)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send email with raw token (not hashed)
    await sendResetEmail(email, resetToken);

    res.status(200).json({ message: 'If an account exists with this email, a password reset link has been sent' });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body as { token: string; newPassword: string };
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = hashToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: new Date() }, // Token must not be expired
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired reset token' });
    }

    // Update password and clear reset token
    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
};

export default { register, login, googleLogin, forgotPassword, resetPassword };
