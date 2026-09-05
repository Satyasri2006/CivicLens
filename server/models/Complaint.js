import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'English',
    },
    category: {
      type: String,
      default: 'Sanitation',
    },
    issueType: {
      type: String,
      default: 'Civic Grievance',
    },
    severity: {
      type: String,
      default: 'High',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'HIGH',
    },
    department: {
      type: String,
      default: 'Municipal Sanitation Department',
    },
    duration: {
      type: String,
      default: 'Recent',
    },
    location: {
      latitude: { type: Number, default: 17.3850 },
      longitude: { type: Number, default: 78.4867 },
      address: { type: String, default: 'Block B, XYZ Road' },
    },
    evidence: {
      type: [String],
      default: [],
    },
    aiAnalysis: {
      summary: String,
      safetyRisk: String,
      justification: String,
      requiredEvidence: [String],
    },
    generatedComplaint: {
      subject: String,
      body: String,
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'in_progress', 'resolved'],
      default: 'submitted',
    },
  },
  {
    timestamps: true,
  }
);

export const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
