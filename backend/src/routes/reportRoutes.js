import { Router } from 'express';
import { getReport } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/:type', getReport);

export default router;
