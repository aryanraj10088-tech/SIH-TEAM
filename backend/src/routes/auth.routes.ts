import { Router } from 'express';
import { login, logout, me, getRecentActivity, signup, verifyOtp, resendOtp } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, me);
router.get('/activity/recent', protect, getRecentActivity);

export default router;
