import { Router } from 'express';
import { getProjects, createProject, getProjectDetails } from '../controllers/project.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectDetails);

export default router;
