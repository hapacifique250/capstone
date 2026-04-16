import { Router } from 'express';
import {
  submitApplication,
  getApplications,
  getApplicationStatus,
} from '../controllers/applicationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, submitApplication);
router.get('/', authMiddleware, getApplications);
router.get('/:applicationId', authMiddleware, getApplicationStatus);

export default router;
