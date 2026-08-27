import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';

export const generateToken = (res: Response, userId: string, role: string) => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any,
  };
  
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET as string, options);

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};
