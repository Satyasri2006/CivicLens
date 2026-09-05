import express from 'express';
import { getAdminComplaints, getAdminStats } from '../controllers/adminController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/complaints', verifyToken, requireAdmin, getAdminComplaints);
router.get('/stats', verifyToken, requireAdmin, getAdminStats);

export default router;
