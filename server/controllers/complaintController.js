import { Complaint } from '../models/Complaint.js';
import { analyzeComplaintWithGemini } from '../services/geminiService.js';
import { determineDepartment, calculatePriority } from '../utils/routingRules.js';

// In-memory complaint fallback store (isolated per user)
let memoryComplaints = [];

export const analyzeComplaint = async (req, res) => {
  try {
    const { description, language = 'English', location = 'Block B, XYZ Road' } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Complaint description is required.' });
    }

    // 1. Send description to Gemini for structured JSON classification
    const aiResult = await analyzeComplaintWithGemini(description, language);

    // 2. Apply controlled application rules for official department routing
    const officialDepartment = determineDepartment(aiResult.category, aiResult.issueType, description);

    // 3. Apply deterministic priority rules
    const calculatedPriority = calculatePriority(aiResult.severity, aiResult.safetyRisk, aiResult.duration, description);

    return res.json({
      category: aiResult.category,
      issueType: aiResult.issueType,
      severity: aiResult.severity,
      priority: calculatedPriority,
      department: officialDepartment,
      duration: aiResult.duration,
      location: typeof location === 'string' ? { address: location } : location,
      safetyRisk: aiResult.safetyRisk,
      requiredEvidence: aiResult.requiredEvidence,
      summary: aiResult.summary,
      justification: aiResult.justification,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error analyzing complaint.', error: error.message });
  }
};

export const createComplaint = async (req, res) => {
  try {
    // When sent as multipart/form-data, nested objects arrive as JSON strings
    const safeParse = (val) => {
      if (!val) return undefined;
      if (typeof val === 'object') return val;
      try { return JSON.parse(val); } catch { return val; }
    };

    const {
      description,
      language = 'English',
      category = 'Sanitation',
      issueType = 'Civic Grievance',
      severity = 'High',
      priority,
      department,
      duration = 'Recent',
    } = req.body;

    const location = safeParse(req.body.location) || { address: 'Block B, XYZ Road' };
    const aiAnalysis = safeParse(req.body.aiAnalysis);
    const generatedComplaint = safeParse(req.body.generatedComplaint);

    if (!description) {
      return res.status(400).json({ message: 'Description is required.' });
    }

    // Convert uploaded image files to base64 data URIs for MongoDB storage
    let evidence = [];
    if (req.files && req.files.length > 0) {
      evidence = req.files.map((file) => {
        const base64 = file.buffer.toString('base64');
        return `data:${file.mimetype};base64,${base64}`;
      });
    } else {
      // Fallback: use evidence strings from body (backward compat with JSON requests)
      const bodyEvidence = safeParse(req.body.evidence) || req.body.evidence;
      evidence = Array.isArray(bodyEvidence) ? bodyEvidence : bodyEvidence ? [String(bodyEvidence)] : [];
    }

    const officialDepartment = department || determineDepartment(category, issueType, description);
    const finalPriority = priority || calculatePriority(severity, aiAnalysis?.safetyRisk, duration, description);
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const caseId = `CL-${randomNum}`;

    const defaultSubject = `Official Complaint Notice: ${issueType}`;
    const defaultBody = `${description}\n\nLocation: ${typeof location === 'string' ? location : location.address || 'Specified Area'}\nDepartment: ${officialDepartment}`;

    let newComplaint = null;
    try {
      newComplaint = await Complaint.create({
        caseId,
        userId: req.user.id,
        description,
        language,
        category,
        issueType,
        severity,
        priority: finalPriority,
        department: officialDepartment,
        duration,
        location: typeof location === 'string' ? { address: location } : location,
        evidence,
        aiAnalysis: aiAnalysis || {
          summary: description,
          safetyRisk: 'Moderate',
          justification: 'Analyzed by CivicLens AI.',
          requiredEvidence: ['Photo', 'Location'],
        },
        generatedComplaint: generatedComplaint || {
          subject: defaultSubject,
          body: defaultBody,
        },
        status: 'submitted',
      });
    } catch (dbErr) {
      newComplaint = {
        _id: `c_${Date.now()}`,
        caseId,
        userId: req.user.id,
        description,
        language,
        category,
        issueType,
        severity,
        priority: finalPriority,
        department: officialDepartment,
        duration,
        location: typeof location === 'string' ? { address: location } : location,
        evidence,
        aiAnalysis: aiAnalysis || {
          summary: description,
          safetyRisk: 'Moderate',
          justification: 'Analyzed by CivicLens AI.',
          requiredEvidence: ['Photo', 'Location'],
        },
        generatedComplaint: generatedComplaint || {
          subject: defaultSubject,
          body: defaultBody,
        },
        status: 'submitted',
        createdAt: new Date().toISOString(),
      };
      memoryComplaints.unshift(newComplaint);
    }

    return res.status(201).json(newComplaint);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating complaint.', error: error.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    let list = [];
    try {
      if (req.user.role === 'admin') {
        list = await Complaint.find().sort({ createdAt: -1 }).populate('userId', 'name email');
      } else {
        list = await Complaint.find({ userId: req.user.id }).sort({ createdAt: -1 });
      }
    } catch (dbErr) {
      if (req.user.role === 'admin') {
        list = memoryComplaints;
      } else {
        list = memoryComplaints.filter((c) => String(c.userId) === String(req.user.id));
      }
    }
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving complaints.' });
  }
};

export const getComplaintByCaseId = async (req, res) => {
  try {
    const { caseId } = req.params;
    let complaint = null;
    try {
      complaint = await Complaint.findOne({ caseId }).populate('userId', 'name email');
    } catch (dbErr) {
      complaint = memoryComplaints.find((c) => c.caseId === caseId);
    }

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching complaint.' });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { status, department, priority } = req.body;

    let complaint = null;
    try {
      complaint = await Complaint.findOne({ caseId });
      if (complaint) {
        if (status) complaint.status = status;
        if (department) complaint.department = department;
        if (priority) complaint.priority = priority;
        await complaint.save();
      }
    } catch (dbErr) {
      complaint = memoryComplaints.find((c) => c.caseId === caseId);
      if (complaint) {
        if (status) complaint.status = status;
        if (department) complaint.department = department;
        if (priority) complaint.priority = priority;
      }
    }

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    return res.json({ message: 'Complaint updated successfully.', complaint });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating complaint status.' });
  }
};
