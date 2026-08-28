import { Router } from 'express';
import { getProjects, createProject, getProjectDetails, generateProjectContent } from '../controllers/project.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectDetails);

router.post('/:id/generate', generateProjectContent);

export default router;
