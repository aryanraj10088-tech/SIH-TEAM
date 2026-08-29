import { Router } from 'express';
import { 
  createOutput, 
  getOutputs, 
  getOutputById, 
  editContent, 
  submitForReview, 
  addComment, 
  reviewOutput 
} from '../controllers/output.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', createOutput);
router.get('/', getOutputs);
router.get('/:id', getOutputById);
router.patch('/:id/content', editContent);
router.post('/:id/submit', submitForReview);
router.post('/:id/comment', addComment);

// Only reviewers and admins can approve/reject
router.post('/:id/review', authorize('Reviewer', 'Administrator'), reviewOutput);

export default router;

