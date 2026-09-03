import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Global API rate limiter (fallback)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' },
});

// Login brute-force protection: 5 attempts per 15 minutes per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts from this IP, please try again after 15 minutes.' },
});

// AI Generation limits: 10 jobs per hour, 30 per day per user
// We use a custom key generator to limit by user ID rather than IP for generation
const keyGenerator = (req: Request): string => {
  return req.user?._id?.toString() || req.ip || 'unknown';
};

export const generationHourlyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Hourly generation limit (10) reached. Please try again later.' },
});

export const generationDailyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 30,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Daily generation limit (30) reached. Please try again tomorrow.' },
});
