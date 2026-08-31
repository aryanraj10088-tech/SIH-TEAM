import { Router } from 'express';
import { searchReviewers } from '../controllers/user.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);
router.get('/reviewers', authorize('Administrator'), searchReviewers);

export default router;
