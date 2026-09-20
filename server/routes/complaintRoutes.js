import express from 'express';
import {
  analyzeComplaint,
  createComplaint,
  getComplaints,
  getComplaintByCaseId,
  updateComplaintStatus,
} from '../controllers/complaintController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/analyze', verifyToken, analyzeComplaint);
router.post('/', verifyToken, upload.array('evidence', 5), createComplaint);
router.get('/', verifyToken, getComplaints);
router.get('/:caseId', verifyToken, getComplaintByCaseId);
router.put('/:caseId/status', verifyToken, requireAdmin, updateComplaintStatus);

export default router;
