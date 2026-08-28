import { Router } from 'express';
import { generateContent } from '../controllers/generation.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', generateContent);

export default router;
