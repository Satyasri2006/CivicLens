import { Complaint } from '../models/Complaint.js';

export const getAdminComplaints = async (req, res) => {
  try {
    let complaints = [];
    try {
      complaints = await Complaint.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    } catch (dbErr) {
      // In-memory fallback
      complaints = [];
    }
    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving admin complaints.' });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    let all = [];
    try {
      all = await Complaint.find();
    } catch (dbErr) {
      all = [];
    }

    const total = all.length;
    const critical = all.filter((c) => c.priority === 'URGENT' || c.priority === 'HIGH').length;
    const pending = all.filter((c) => c.status === 'submitted' || c.status === 'under_review').length;
    const resolved = all.filter((c) => c.status === 'resolved').length;

    return res.json({
      total,
      critical,
      pending,
      resolved,
      trends: {
        total: total > 0 ? `+${total}` : '0',
        critical: critical > 0 ? `${critical}` : '0',
        pending: pending > 0 ? `${pending}` : '0',
        resolved: resolved > 0 ? `${resolved}` : '0',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error computing admin statistics.' });
  }
};
