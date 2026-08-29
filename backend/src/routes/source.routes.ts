import { Router } from 'express';
import multer from 'multer';
<<<<<<< Updated upstream
import { uploadSource } from '../controllers/source.controller';
=======
import { getSources, uploadSource, deleteSource } from '../controllers/source.controller';
>>>>>>> Stashed changes
import { protect } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true }); // Merge params to access projectId from parent route

// Use memory storage to inspect buffer for magic numbers before S3 upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

router.use(protect);

router.get('/', getSources);
router.post('/', upload.single('file'), uploadSource);

export default router;
