import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): void => {
  // Try to get token from cookies
  let token = req.headers?.cookie;

  // If still no token, unauthorized
  if (!token) {
    token = req.headers.authorization;
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
  }

  try {
    token = token?.split('token=')[1];
    const decoded: any = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    );
    if (!decoded.username) {
      console.log('Token does not contain username');
      throw new Error('Invalid token structure');
    }
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;
