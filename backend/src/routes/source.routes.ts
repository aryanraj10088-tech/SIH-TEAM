import { Router } from 'express';
import multer from 'multer';
import { uploadSource, deleteSource } from '../controllers/source.controller';
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

router.post('/', upload.single('file'), uploadSource);
router.delete('/:sourceId', deleteSource);

export default router;
