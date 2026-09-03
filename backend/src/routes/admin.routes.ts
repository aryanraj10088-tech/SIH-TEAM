import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.middleware';
import { getSystemStats, inviteReviewer, getReviewers, resendInvitation, getPendingUsers, approveUser, rejectUser } from '../controllers/admin.controller';

const router = Router();

router.use(protect);
router.use(authorize('Administrator'));

router.get('/stats', getSystemStats);
router.post('/reviewers/invite', inviteReviewer);
router.get('/reviewers', getReviewers);
router.post('/reviewers/:id/resend-invitation', resendInvitation);

router.get('/pending-users', getPendingUsers);
router.post('/pending-users/:id/approve', approveUser);
router.post('/pending-users/:id/reject', rejectUser);

export default router;
