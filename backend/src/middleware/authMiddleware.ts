import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type AuthRequest = Request & { userId?: string };

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization || req.headers.Authorization;
	if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Missing or invalid Authorization header' });
	}

	const token = authHeader.split(' ')[1];
	const jwtSecret = process.env.JWT_SECRET;
	if (!jwtSecret) {
		console.error('JWT_SECRET not set');
		return res.status(500).json({ message: 'Server configuration error' });
	}

	try {
		const payload = jwt.verify(token, jwtSecret) as { userId?: string };
		if (!payload || !payload.userId) return res.status(401).json({ message: 'Invalid token' });
		req.userId = payload.userId;
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' });
	}
};

export default authMiddleware;

