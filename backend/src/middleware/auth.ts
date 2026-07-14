import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.js';

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const secret = req.headers['x-admin-secret'];
  const expected = process.env.ADMIN_SECRET ?? '';
  const received = Array.isArray(secret) ? secret[0] : (secret ?? '');
  if (!received || received.toLowerCase() !== expected.toLowerCase()) {
    return next(new AppError('Unauthorized', 401));
  }
  next();
}
