import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface JwtPayload {
  userId: string;
  role: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      req.user = (await User.findById(decoded.userId).select('-passwordHash')) || undefined;

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as this role' });
    }
  };
};

export const requireSameOrg = (req: Request, res: Response, next: NextFunction): void => {
  const targetOrgId = req.body.organizationId || req.query.organizationId;
  
  if (!req.user || req.user.accountType !== 'ORGANIZATION') {
    next();
    return;
  }

  if (targetOrgId && targetOrgId !== req.user.organizationId?.toString()) {
    res.status(403).json({ message: 'Not authorized for this organization' });
    return;
  }
  
  next();
};
