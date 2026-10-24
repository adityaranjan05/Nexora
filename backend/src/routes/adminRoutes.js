import { Router } from 'express';
import {
  getSlaRules,
  updateSlaRule,
  getUsers,
  getBureaus,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();

router.use(authenticate);

router.get('/sla-rules', getSlaRules);
router.put('/sla-rules', authorize(['super_admin']), updateSlaRule);
router.get('/users', authorize(['super_admin', 'senior_management']), getUsers);
router.get('/bureaus', getBureaus);

export default router;
