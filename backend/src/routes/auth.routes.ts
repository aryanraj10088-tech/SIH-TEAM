import { Router } from 'express';
import passport from 'passport';
import {
  login,
  logout,
  me,
  getRecentActivity,
  signup,
  // verifyOtp,   // OTP verification removed — signup completes immediately
  // resendOtp,   // OTP resend removed — signup completes immediately
  googleCallback,
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { loginLimiter } from '../middlewares/rateLimit.middleware';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, signupSchema } from '../schemas';

const router = Router();

// ── Email / Password ──────────────────────────────────────────────────────────
router.post('/signup', validate(signupSchema), signup);
// router.post('/verify-otp', verifyOtp);  // OTP step removed from signup flow
// router.post('/resend-otp', resendOtp);  // OTP step removed from signup flow
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);

// ── Google OAuth ──────────────────────────────────────────────────────────────
// Step 1: Redirect user to Google's account chooser
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Step 2: Google redirects back here after user picks an account
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`,
  }),
  googleCallback
);

// ── Protected ─────────────────────────────────────────────────────────────────
router.get('/me', protect, me);
router.get('/activity/recent', protect, getRecentActivity);

export default router;
