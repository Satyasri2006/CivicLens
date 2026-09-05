import { Complaint } from '../models/Complaint.js';
import { analyzeComplaintWithGemini } from '../services/geminiService.js';
import { determineDepartment, calculatePriority } from '../utils/routingRules.js';

// In-memory complaint fallback store
let memoryComplaints = [
  {
    _id: 'c_1',
    caseId: 'CL-10482',
    userId: 'user_citizen_1',
    description: 'There has been garbage piling up outside my college for the last five days. The smell is unbearable and residents are suffering.',
    language: 'English',
    category: 'Sanitation',
    issueType: 'Garbage accumulation',
    severity: 'High',
    priority: 'HIGH',
    department: 'Municipal Sanitation Department',
    duration: '5 days',
    location: { latitude: 17.3850, longitude: 78.4867, address: 'Block B, XYZ Road' },
    evidence: ['garbage_photo_1.jpg', 'garbage_area.jpg'],
    aiAnalysis: {
      summary: 'Persistent garbage accumulation near college campus causing severe public risk.',
      safetyRisk: 'Moderate',
      justification: 'Waste uncollected for 5 days in a public area creates hygiene and health concerns.',
      requiredEvidence: ['Photo', 'Location'],
    },
    generatedComplaint: {
      subject: 'Urgent Garbage Accumulation Complaint',
      body: 'Garbage has remained uncollected near Block B on XYZ Road for approximately five days. Immediate action requested from Municipal Sanitation Department.',
    },
    status: 'in_progress',
    createdAt: new Date('2026-09-02T10:32:00Z').toISOString(),
  },
  {
    _id: 'c_2',
    caseId: 'CL-10471',
    userId: 'user_citizen_1',
    description: 'Large pothole causing traffic disruption and vehicle damage near the city center.',
    language: 'English',
    category: 'Roads',
    issueType: 'Pothole on main road',
    severity: 'High',
    priority: 'HIGH',
    department: 'Public Works Department',
    duration: '3 weeks',
    location: { latitude: 17.3900, longitude: 78.4890, address: 'Main Street near City Hall' },
    evidence: ['pothole.jpg'],
    aiAnalysis: {
      summary: 'Severe road surface defect causing traffic hazard.',
      safetyRisk: 'High',
      justification: 'Deep pothole on high-speed corridor increases collision risks.',
      requiredEvidence: ['Photo'],
    },
    generatedComplaint: {
      subject: 'Pothole Repair Notice - Main Street',
      body: 'Hazardous road condition reported on Main Street near City Hall.',
    },
    status: 'submitted',
    createdAt: new Date('2026-09-01T09:15:00Z').toISOString(),
  },
];

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
    const {
      description,
      language = 'English',
      category = 'Sanitation',
      issueType = 'Civic Grievance',
      severity = 'High',
      priority,
      department,
      duration = 'Recent',
      location = { address: 'Block B, XYZ Road' },
      evidence = [],
      aiAnalysis,
      generatedComplaint,
    } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required.' });
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
        evidence: Array.isArray(evidence) ? evidence : [String(evidence)],
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
        evidence: Array.isArray(evidence) ? evidence : [String(evidence)],
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
        list = memoryComplaints.filter((c) => String(c.userId) === String(req.user.id) || true);
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
