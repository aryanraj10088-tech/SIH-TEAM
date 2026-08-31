import { Router } from 'express';
import { getProjects, createProject, getProjectDetails, generateProjectContent, deleteProject, assignProjectAccess } from '../controllers/project.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectDetails)
  .delete(deleteProject);

router.post('/:id/generate', generateProjectContent);
router.post('/:id/assign', assignProjectAccess);

export default router;
