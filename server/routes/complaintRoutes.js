import express from 'express';
import {
  analyzeComplaint,
  createComplaint,
  getComplaints,
  getComplaintByCaseId,
  updateComplaintStatus,
} from '../controllers/complaintController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/analyze', verifyToken, analyzeComplaint);
router.post('/', verifyToken, createComplaint);
router.get('/', verifyToken, getComplaints);
router.get('/:caseId', verifyToken, getComplaintByCaseId);
router.put('/:caseId/status', verifyToken, requireAdmin, updateComplaintStatus);

export default router;
