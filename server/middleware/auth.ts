import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, StoredUser } from '../data/store';

const JWT_SECRET = process.env.JWT_SECRET || 'ahti-store-secure-jwt-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: StoredUser;
}

export function generateToken(user: StoredUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = db.findUserById(decoded.id);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Invalid or expired token
  }
  next();
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required. Please log in to continue.',
    });
  }
  next();
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required. Please log in as an administrator.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied. Administrator privileges required.',
    });
  }

  next();
}
