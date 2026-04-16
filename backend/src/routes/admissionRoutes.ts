import { Router } from 'express';
import {
  processAdmissions,
  getAdmissions,
  getProgramRankings,
  getApplicantAdmissions,
  overrideDecision,
  getFairnessReport,
} from '../controllers/admissionController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

// Public endpoints
router.get('/applicant/my-admissions', authMiddleware, getApplicantAdmissions);

// Admin endpoints
router.post('/process', authMiddleware, adminMiddleware, processAdmissions);
router.get('/list', authMiddleware, adminMiddleware, getAdmissions);
router.get('/program/:programId/rankings', authMiddleware, adminMiddleware, getProgramRankings);
router.put('/:admissionId/override', authMiddleware, adminMiddleware, overrideDecision);
router.get('/report/fairness', authMiddleware, adminMiddleware, getFairnessReport);

export default router;
