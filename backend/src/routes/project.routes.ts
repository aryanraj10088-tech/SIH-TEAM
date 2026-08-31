import { Router } from 'express';
import { getProjects, createProject, getProjectDetails, generateProjectContent, deleteProject, getAssignableProjects, addReviewer, removeReviewer } from '../controllers/project.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

// Admin-only endpoints
router.get('/admin/assignable', authorize('Administrator'), getAssignableProjects);
router.post('/:id/assign-reviewer', authorize('Administrator'), addReviewer);
router.delete('/:id/assign-reviewer/:reviewerId', authorize('Administrator'), removeReviewer);

router.route('/')
  .get(getProjects)
  .post(authorize('Operator', 'Administrator'), createProject);

router.route('/:id')
  .get(getProjectDetails)
  .delete(authorize('Operator', 'Administrator'), deleteProject);

router.post('/:id/generate', authorize('Operator', 'Administrator'), generateProjectContent);

export default router;
