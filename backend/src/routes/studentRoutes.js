import { Router } from 'express';
import {
  getStudentCases,
  getStudentCaseById,
  createStudentCase,
  replyStudentCase,
} from '../controllers/caseController.js';
import {
  getStudentNotifications,
  markAlertAsRead,
} from '../controllers/alertController.js';
import { getInstitutions } from '../controllers/institutionController.js';

const router = Router();

// ============================================================================
// STUDENT CASES
// ============================================================================
router.get('/cases', getStudentCases);
router.get('/cases/:id', getStudentCaseById);
router.post('/cases', createStudentCase);
router.post('/cases/:id/reply', replyStudentCase);

// ============================================================================
// NOTIFICATIONS
// ============================================================================
router.get('/notifications', getStudentNotifications);
router.post('/notifications/:id/read', markAlertAsRead);

// Helper for institution selection during complaint submission
router.get('/institutions', getInstitutions);

export default router;
