import { Router } from 'express';
import {
  uploadBulkFile,
  runManualSync,
  uploadMiddleware,
} from '../controllers/importSyncController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();

router.use(authenticate);

router.post('/upload', authorize(['super_admin', 'data_operator', 'bureau_officer']), uploadMiddleware.single('file'), uploadBulkFile);
router.post('/sync/run', authorize(['super_admin', 'senior_management', 'data_operator', 'bureau_officer']), runManualSync);

export default router;
