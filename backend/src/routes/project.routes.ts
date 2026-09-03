import { Router } from 'express';
import { getProjects, createProject, getProjectDetails, generateProjectContent, deleteProject, getAssignableProjects, addReviewer, removeReviewer } from '../controllers/project.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { generationHourlyLimiter, generationDailyLimiter } from '../middlewares/rateLimit.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createProjectSchema, generateProjectSchema } from '../schemas';

const router = Router();

router.use(protect);

// Admin-only endpoints
router.get('/admin/assignable', authorize('Administrator'), getAssignableProjects);
router.post('/:id/assign-reviewer', authorize('Administrator'), addReviewer);
router.delete('/:id/assign-reviewer/:reviewerId', authorize('Administrator'), removeReviewer);

router.route('/')
  .get(getProjects)
  .post(authorize('Operator', 'Administrator'), validate(createProjectSchema), createProject);

router.route('/:id')
  .get(getProjectDetails)
  .delete(authorize('Operator', 'Administrator'), deleteProject);

router.post('/:id/generate', authorize('Operator', 'Administrator'), generationHourlyLimiter, generationDailyLimiter, validate(generateProjectSchema), generateProjectContent);

export default router;
