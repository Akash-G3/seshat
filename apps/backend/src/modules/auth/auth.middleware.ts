// module/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../shared/utils/jwt';
import { AppError } from '../../shared/errors/appError';

export interface AuthenticatedRequest<P = Record<string, string>> extends Request<P> {
  userId?: string;
}

export function requireAuth(req: AuthenticatedRequest, _: Response, next: NextFunction) {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return next(new AppError('Not authenticated', 401));
  }

  try {
    const payload = verifyAccessToken(accessToken);
    req.userId = payload.userId;
    next();
  } catch {
    return next(new AppError('Invalid or expired access token', 401));
  }
}
