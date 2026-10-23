import { Router } from 'express';
import {
  getCases,
  getCaseById,
  getCaseHistory,
  updateCase,
  addCaseAction,
  transferCase,
  escalateCase,
  linkCases,
} from '../controllers/caseController.js';
import { authenticate } from '../middleware/auth.js';
import { canEditCase, authorize } from '../middleware/roles.js';

const router = Router();

router.use(authenticate);

router.get('/', getCases);
router.post('/link', canEditCase, linkCases);
router.get('/:id', getCaseById);
router.get('/:id/history', getCaseHistory);
router.patch('/:id', canEditCase, updateCase);
router.post('/:id/actions', canEditCase, addCaseAction);
router.post('/:id/transfer', canEditCase, transferCase);
router.post('/:id/escalate', canEditCase, escalateCase);

export default router;
