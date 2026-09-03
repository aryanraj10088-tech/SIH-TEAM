import { Router } from 'express';
import { 
  createOutput, 
  getOutputs, 
  getOutputById, 
  editContent, 
  submitForReview, 
  addComment, 
  reviewOutput,
  getPendingReviews,
  serveImage
} from '../controllers/output.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Allow image serving via capability key without auth so img tags work cleanly
router.get('/image/serve', serveImage);

router.use(protect);

router.post('/', authorize('Operator', 'Administrator'), createOutput);
router.get('/', getOutputs);

// Specific paths must go before parameterized paths
router.get('/pending', authorize('Reviewer', 'Administrator'), getPendingReviews);

router.get('/:id', getOutputById);
router.patch('/:id/content', authorize('Operator', 'Administrator'), editContent);
router.post('/:id/submit', authorize('Operator', 'Administrator'), submitForReview);
router.post('/:id/comment', addComment); // Anyone with read access can comment

// Only reviewers and admins can approve/reject
router.post('/:id/review', authorize('Reviewer', 'Administrator'), reviewOutput);

export default router;
