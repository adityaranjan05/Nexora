import { Router } from 'express';
import { getInstitutions, getInstitutionById } from '../controllers/institutionController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getInstitutions);
router.get('/:id', getInstitutionById);

export default router;
