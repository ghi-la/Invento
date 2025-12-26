import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): void => {
  // Try to get token from cookies
  let token= req.cookies?.token;

  // If not in cookies, check Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]; // Extract token after "Bearer"
    }
  }

  // If still no token, unauthorized
  if (!token) {
    console.error('No token found');
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as jwt.JwtPayload;
    if (!decoded.username) {
      throw new Error('Invalid token structure');
    }
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
      res.status(403).json({ message: 'Invalid token' });
      return;
  }
};

export default authMiddleware;
