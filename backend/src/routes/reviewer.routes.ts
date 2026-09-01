import { Router } from 'express';
import { acceptInvitation, validateInvitation } from '../controllers/reviewer.controller';

const router = Router();

// These are public routes (the reviewer isn't logged in yet)
router.get('/validate-invitation', validateInvitation);
router.post('/accept-invitation', acceptInvitation);

export default router;
