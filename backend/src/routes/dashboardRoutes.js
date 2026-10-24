import { Router } from 'express';
import {
  getDashboardSummary,
  getBureauWorkload,
  getInstitutionStatus,
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/summary', getDashboardSummary);
router.get('/bureau-workload', getBureauWorkload);
router.get('/institution-status', getInstitutionStatus);

export default router;
