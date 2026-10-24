import { Router } from 'express';
import { getAlerts, markAlertAsRead } from '../controllers/alertController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getAlerts);
router.post('/:id/read', markAlertAsRead);

export default router;
