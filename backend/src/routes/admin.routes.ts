import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.middleware';
import { getSystemStats } from '../controllers/admin.controller';

const router = Router();

router.use(protect);
router.use(authorize('Administrator'));

router.get('/stats', getSystemStats);

export default router;
