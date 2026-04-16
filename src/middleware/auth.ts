import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Extend Express Request to include user info
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// Middleware to protect routes
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Get the token part

    if (!token) {
      res.status(401).json({ message: 'Access denied. No token provided.' });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);
    req.user = decoded; // Attach user info to request
    next(); // Continue to next middleware/route handler
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};