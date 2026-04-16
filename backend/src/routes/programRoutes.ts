import { Router } from 'express';
import {
  createProgram,
  getPrograms,
  getProgram,
  updateProgram,
  deleteProgram,
} from '../controllers/programController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', getPrograms);
router.get('/:id', getProgram);
router.post('/', authMiddleware, adminMiddleware, createProgram);
router.put('/:id', authMiddleware, adminMiddleware, updateProgram);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProgram);

export default router;
