# 🏛️ CivicLens — AI-Powered Civic Grievance Reporting & Management

**CivicLens** is an intelligent, full-stack civic engagement platform that empowers citizens to report civic grievances (potholes, garbage accumulation, broken streetlights, water leakages, drainage issues) using text, voice, or photo evidence. 

Integrated with the **Google Gemini API**, CivicLens automatically analyzes, classifies, prioritizes, and routes complaints to the appropriate municipal department, while generating formal, bilingual government-ready notices and providing end-to-end case tracking.

---

## 🌟 Key Features

### 👤 Citizen Experience
- **Multi-Modal Reporting**: Report problems via plain text, voice dictation, or photo capture.
- **Direct Database Image Evidence**: Upload up to 5 photos (JPEG, PNG, WebP up to 5MB each) stored directly in MongoDB as Base64 Data URIs without requiring third-party storage services.
- **AI-Powered Structuring (Gemini API)**: Automatically extracts category, issue type, severity, duration, safety risks, and evidence requirements.
- **Automated Formal Notice Generation**: Converts informal citizen reports into structured government complaint letters in multiple languages (**English, Telugu, Hindi, Tamil, Kannada, Malayalam**).
- **Case Tracking & Timeline**: Track grievance status in real time with unique case IDs (`CL-XXXXX`) and timeline milestones.
- **Citizen Dashboard & History**: View previous complaints, search, filter by status and priority, and inspect attached evidence.

### 🛡️ Administrative Portal
- **Admin Operations Dashboard**: Overview of civic issues across all municipal jurisdictions.
- **Triage & Department Assignment**: Reassign departments (Sanitation, Public Works, Electricity, Water Supply, Drainage) and escalate priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
- **Status Lifecycle Management**: Transition complaints from `Submitted` → `Under Review` → `In Progress` → `Resolved`.
- **Attached Evidence Inspection**: Direct in-app preview of uploaded photo evidence stored in the database.
- **Internal Audit & Notes**: Add internal admin notes and track resolution timestamps.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| **Backend** | Node.js, Express 4 |
| **Database** | MongoDB & Mongoose (with built-in offline/in-memory fallback) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs password hashing |
| **AI / LLM** | Google Gemini API (`@google/genai` v2.x) |
| **File Handling** | Multer (memory storage) & Base64 Data URI encoding |

---

## 📁 Project Structure

```plaintext
CivicLens/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & offline fallback
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, session check
│   │   ├── complaintController.js# AI analysis, CRUD & Base64 image storage
│   │   └── adminController.js    # Admin stats & complaint management
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role authorization
│   │   └── upload.js             # Multer memory storage (5MB limit, images)
│   ├── models/
│   │   ├── User.js               # Citizen & Admin schema
│   │   └── Complaint.js          # Mongoose complaint schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── complaintRoutes.js    # /api/complaints endpoints
│   │   └── adminRoutes.js        # /api/admin endpoints
│   ├── services/
│   │   └── geminiService.js      # Google Gemini 2.5 classification & prompt
│   ├── utils/
│   │   └── routingRules.js       # Department routing & priority heuristics
│   └── index.js                  # Express application entrypoint
│
├── src/
│   ├── components/               # Navbar, badges, cards, modals, sidebar
│   ├── pages/
│   │   ├── LandingPage.tsx       # Public homepage
│   │   ├── CitizenDashboard.tsx  # Citizen overview & recent reports
│   │   ├── ReportIssue.tsx       # Issue report form with real file picker
│   │   ├── AIAnalysisPage.tsx    # Live Gemini AI classification display
│   │   ├── GeneratedComplaint.tsx# Notice review & multi-language selector
│   │   ├── SuccessPage.tsx       # Submission confirmation & Case ID
│   │   ├── CaseTracking.tsx      # Public case tracker & photo gallery
│   │   ├── ComplaintHistory.tsx  # Searchable, filterable history table
│   │   ├── AdminDashboard.tsx    # Administrative analytics & list
│   │   └── AdminComplaintDetails.tsx # Detailed view, photos & status controls
│   ├── services/
│   │   └── api.ts                # Frontend API client (JWT & multipart requests)
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces & formatComplaint utility
│   ├── App.tsx                   # Main router, session state & auth guard
│   └── main.tsx                  # React entrypoint
│
├── .env.example                  # Environment configuration template
├── package.json                  # Dependencies and scripts
└── vite.config.ts                # Vite & Tailwind configuration
