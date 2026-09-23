import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

export const tenantContext = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.tenantId) {
    return next(new AppError('Unauthorized: Tenant context not found', 401));
  }
  
  req.tenantId = req.user.tenantId;
  next();
};
