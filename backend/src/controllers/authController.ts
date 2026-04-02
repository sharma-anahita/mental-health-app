import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User, { IUser } from '../models/User';

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

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
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

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

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

    const token = signToken(user._id.toString());

    return res.json({ token, user: buildUserResponse(user) });
  } catch (err) {
    next(err);
  }
};

export default { register, login, googleLogin };
