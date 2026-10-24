import { Router } from 'express';
import { getOverlaps, getOverlapById, resolveOverlap } from '../controllers/overlapController.js';
import { authenticate } from '../middleware/auth.js';
import { canEditCase } from '../middleware/roles.js';

const router = Router();

router.use(authenticate);

router.get('/', getOverlaps);
router.get('/:id', getOverlapById);
router.post('/:id/resolve', canEditCase, resolveOverlap);

export default router;
