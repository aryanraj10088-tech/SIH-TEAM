import { Router } from 'express';
import { login, logout, me, getRecentActivity } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, me);
router.get('/activity/recent', protect, getRecentActivity);

export default router;
