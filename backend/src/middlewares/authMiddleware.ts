import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Helper to parse cookies from header string
function getCookieToken(cookieHeader?: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? match[1] : undefined;
}

export const authMiddleware = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): void => {
  let token: string | undefined;

  // Try to get token from cookies
  token = getCookieToken(req.headers?.cookie);

  // If not in cookies, try Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else {
      token = authHeader;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    if (!decoded || !decoded.username) {
      throw new Error('Invalid token structure');
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;
