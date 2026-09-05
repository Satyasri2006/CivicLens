Create a modern, polished, responsive web application called **CivicLens — AI-Powered Citizen Grievance & Government Service Assistant**.

## 1. Product Concept

CivicLens helps citizens report civic problems such as:

* Garbage accumulation
* Potholes and damaged roads
* Broken streetlights
* Water leakage
* Drainage/sewage problems
* Public infrastructure damage
* Other local civic issues

The key idea is:

**“Report a problem. Let AI figure out the rest.”**

A citizen should be able to describe an issue using **text, voice, or an image**, and CivicLens should present an AI-generated analysis showing:

* What the issue is
* Category
* Severity
* Responsible government department
* Priority
* Location
* Duration
* Safety/public-health risk
* Evidence detected from an uploaded image
* A concise explanation of why the issue received that priority

The application should feel like a **real civic-tech product**, not a generic AI chatbot or student dashboard.

---

# 2. Design Direction

Create a clean, trustworthy, civic-focused visual identity.

### Visual style

* Modern SaaS dashboard aesthetic
* Professional but approachable
* Minimal and uncluttered
* Strong visual hierarchy
* Accessible typography
* Rounded cards and buttons
* Subtle shadows
* Clean spacing
* Smooth micro-interactions
* Responsive on desktop, tablet and mobile

The design should communicate:

**Trust + Government + Technology + Accessibility**

Avoid making it look overly futuristic, cyberpunk, or like a generic AI landing page.

Use a restrained civic-inspired color palette with:

* Deep blue / navy as the primary color
* White and light neutral backgrounds
* Green for resolved/success states
* Amber/yellow for medium priority
* Red for urgent/critical issues

Use icons wherever appropriate.

---

# 3. Application Structure

Create the following main pages/screens:

1. Landing Page
2. Citizen Dashboard
3. Report an Issue
4. AI Analysis Result
5. Generated Complaint
6. Case Tracking
7. Complaint History
8. Admin Dashboard
9. Civic Issue Map
10. Admin Complaint Details

Create navigation between these screens so the prototype feels like a real application.

---

# 4. Landing Page

Create a strong hero section.

### Navbar

Logo:

**CivicLens**

Navigation:

* Home
* How It Works
* Features
* About
* Login

Primary button:

**Report an Issue**

### Hero

Headline:

**Report a problem. Let AI figure out the rest.**

Supporting text:

“CivicLens transforms everyday civic complaints into structured, actionable government service requests.”

Include three input modes visually:

**Speak • Snap • Submit**

Show three cards:

🎤 **Speak**
Describe your problem in your language.

📷 **Snap**
Upload a photo of the problem.

✍️ **Type**
Describe the issue in your own words.

Primary CTA:

**Report a Civic Issue**

Secondary CTA:

**See How It Works**

### Hero visual

Show a polished mock civic-analysis interface on the right side containing an example:

Issue:
**Garbage accumulation**

Category:
**Sanitation**

Priority:
**HIGH**

Department:
**Municipal Sanitation**

Status:
**Ready to submit**

This should immediately communicate what CivicLens does.

---

# 5. How It Works Section

Create a four-step visual process:

### Step 1

**Describe the Problem**

Text, voice, or photo.

### Step 2

**AI Understands It**

CivicLens identifies the issue, category, severity and relevant details.

### Step 3

**AI Routes It**

The system identifies the appropriate government department and priority.

### Step 4

**Submit & Track**

Generate a formal complaint and track its status.

Represent this as a clean horizontal timeline on desktop and vertical timeline on mobile.

---

# 6. Features Section

Create cards for:

### Multilingual Reporting

Report civic issues in regional languages.

### AI Issue Classification

Automatically identify the type and category of complaint.

### Smart Department Routing

Suggest the responsible government department.

### Image Evidence Analysis

Analyze uploaded photos to identify visible civic problems.

### Priority Detection

Identify LOW, MEDIUM, HIGH or URGENT issues.

### Complaint Generation

Turn informal descriptions into formal government complaints.

### Case Tracking

Generate a unique case ID and track progress.

### Civic Hotspot Detection

Help administrators identify clusters of recurring problems.

---

# 7. Citizen Dashboard

Create a logged-in citizen dashboard.

Header:

**Good morning, Citizen**

Subtitle:

**Keep track of your civic reports and their progress.**

Primary button:

**+ Report New Issue**

### Statistics cards

* Total Reports: 8
* Pending: 3
* In Progress: 2
* Resolved: 3

### Recent Complaints

Create realistic example cases.

Example:

**CL-10482**

Garbage accumulation

Department:
Municipal Sanitation

Priority:
HIGH

Location:
Block B, XYZ Road

Status:
In Progress

Date:
2 Sep 2026

Create several complaint cards.

### Quick Actions

* Report an Issue
* Track a Case
* View Complaint History

---

# 8. Report an Issue Page

This is one of the most important screens.

Title:

**Report a Civic Issue**

Subtitle:

“Tell us what happened. CivicLens will organize the rest.”

Create a large input area.

### Input method selector

Three tabs/buttons:

🎤 Voice

📷 Photo

✍️ Text

Default to Text.

### Text input

Label:

**Describe your problem**

Placeholder:

“Example: There has been garbage piling up outside my college for the last five days...”

Large textarea.

### Language selector

Label:

**Language**

Options:

* English
* Telugu
* Hindi
* Tamil
* Kannada
* Malayalam

### Location

Create a location section:

**Issue Location**

Button:

**Use My Location**

Also allow manual location entry.

Show a small map preview.

### Photo Upload

Create a drag-and-drop upload area:

**Upload Evidence**

“Add a photo of the issue”

Allow multiple images.

Show uploaded image thumbnails.

### Primary CTA

Large button:

**Analyze Issue with AI →**

When clicked, visually transition to the AI analysis screen.

---

# 9. AI Analysis Screen

Create a polished AI processing state.

Title:

**CivicLens is analyzing your report...**

Show a progress animation with stages:

✓ Understanding your complaint

✓ Identifying the issue

✓ Analyzing evidence

✓ Determining priority

✓ Identifying department

✓ Preparing your complaint

After processing, show the result.

---

# 10. AI Analysis Result

Title:

**Issue Analysis**

Subtitle:

“Here's what CivicLens understood from your report.”

Create a large summary card.

Example:

### Issue

**Garbage accumulation**

### Category

**Sanitation**

### Severity

**HIGH**

### Duration

**5 days**

### Location

**Block B, XYZ Road**

### Responsible Department

**Municipal Sanitation Department**

### Safety Risk

**Moderate**

### Evidence

**Photo detected ✓**

---

# 11. AI Priority Explanation

Create a visually distinct section titled:

**Why is this marked High Priority?**

Do NOT display hidden chain-of-thought or internal model reasoning.

Instead display a short, user-facing explanation based on observable factors.

Example:

> “The waste has remained uncollected for five days in a public area, which may create hygiene and public-health risks.”

Below it show factors:

**Duration:** 5 days

**Public Area:** Yes

**Health Risk:** Moderate

**Evidence:** Photo provided

Create a small priority indicator:

LOW → MEDIUM → HIGH → URGENT

Highlight HIGH.

---

# 12. Evidence Analysis

If a photo is uploaded, create a section:

**AI Evidence Detection**

Show the uploaded image.

Overlay small labels such as:

* Overflowing waste
* Uncollected garbage
* Public area

Add:

**Evidence confidence: High**

Make it clear that this is AI-assisted image analysis.

---

# 13. Generated Complaint Screen

Title:

**Your Complaint is Ready**

Subtitle:

“CivicLens converted your description into a structured government complaint.”

Create a professional complaint document/card.

### Subject

**Urgent Garbage Accumulation Complaint**

### Department

**Municipal Sanitation Department**

### Location

**Block B, XYZ Road**

### Duration

**5 days**

### Priority

**HIGH**

### Complaint

“Garbage has remained uncollected near Block B on XYZ Road for approximately five days. The accumulated waste is creating an unhygienic environment and may pose a public-health concern to residents and students in the area.”

Include:

**Language: English**

Language dropdown:

English / Telugu / Hindi / Tamil / Kannada / Malayalam

Buttons:

**Edit Complaint**

**Submit Complaint**

---

# 14. Complaint Submission Success

After submitting, show a success screen.

Large success icon.

Title:

**Complaint Submitted Successfully**

Case ID:

# CL-10482

Show:

Issue:
Garbage accumulation

Department:
Municipal Sanitation

Priority:
HIGH

Location:
Block B, XYZ Road

Evidence:
2 photos

Status:

**Submitted**

Primary button:

**Track Complaint**

Secondary button:

**Back to Dashboard**

---

# 15. Case Tracking Screen

Title:

**Case CL-10482**

Show a clean tracking timeline.

### Timeline

✓ Complaint Created
2 Sep 2026, 10:32 AM

✓ AI Analysis Completed
2 Sep 2026, 10:33 AM

✓ Submitted to Department
2 Sep 2026, 10:34 AM

● Department Review
Pending

○ Field Action

○ Resolved

Create status badges:

**HIGH PRIORITY**

**SANITATION**

**IN PROGRESS**

Show complaint information and evidence below.

---

# 16. Complaint History

Create a searchable/filterable table or card layout.

Columns:

* Case ID
* Issue
* Category
* Department
* Priority
* Date
* Status

Filters:

* All
* Pending
* In Progress
* Resolved

Priority filters:

* Low
* Medium
* High
* Urgent

Include realistic sample data.

---

# 17. Admin Dashboard

Create a separate admin experience.

Navbar/sidebar:

* Overview
* Complaints
* Civic Map
* Hotspots
* Analytics
* Settings

Header:

**City Operations Dashboard**

Subtitle:

**AI-assisted civic issue monitoring**

### Statistics

Total Complaints:
**1,248**

Critical:
**42**

Pending:
**318**

Resolved:
**888**

Create trend indicators.

---

# 18. Admin Civic Issue Map

This should be one of the strongest visual components.

Create a large interactive-looking city map.

Use colored markers:

🔴 Critical

🟠 High

🟡 Medium

🟢 Resolved

Show clusters of complaints.

Example cluster:

**12 complaints**

**Sanitation**

**Within 500m**

**Last 7 days**

Clicking a cluster should show a small popup with:

“12 sanitation complaints reported within 500m during the last 7 days.”

---

# 19. AI Civic Insights

On the admin dashboard create a section:

**AI Civic Insights**

Example insight card:

### Emerging Sanitation Hotspot

“12 sanitation complaints have been reported within 500m near Sector 14 during the last 7 days.”

Primary issue:

**Overflowing waste bins**

Recommended action:

**Schedule an additional waste collection round.**

Create 2–3 additional insight cards.

Example:

### Road Safety Concern

“Multiple pothole complaints have been reported along XYZ Road.”

Recommended action:

**Prioritize road inspection and repair.**

Make these insights look like decision-support information, not generic chatbot responses.

---

# 20. Admin Complaint Details

Create a detailed complaint view.

Show:

Case ID

Issue

Category

Severity

Priority

Department

Location

Duration

Citizen description

AI summary

AI priority justification

Uploaded evidence

Generated complaint

Current status

Admin actions:

**Assign Department**

**Change Priority**

**Update Status**

Status options:

* Submitted
* Under Review
* In Progress
* Resolved
* Rejected

Include an activity timeline.

---

# 21. Responsive Design

The entire application must be responsive.

Desktop:

* Sidebar dashboards
* Two-column layouts
* Large maps
* Spacious cards

Tablet:

* Collapsible navigation
* Flexible cards

Mobile:

* Bottom navigation where appropriate
* Stacked cards
* Full-width buttons
* Mobile-friendly complaint submission
* Large touch targets

---

# 22. Navigation & Prototype Interactions

Make the prototype navigable.

Landing Page:

Report an Issue → Report Issue Page

Report Issue:

Analyze Issue → AI Analysis

AI Analysis:

Continue → Generated Complaint

Generated Complaint:

Submit Complaint → Success

Success:

Track Complaint → Case Tracking

Dashboard:

Click complaint → Case Tracking

Admin Dashboard:

Click map cluster → Complaint/Cluster Details

Use realistic hover, loading, success and transition states.

---

# 23. Important UI States

Create designs for:

* Empty state
* Loading state
* AI processing state
* Successful submission
* Failed AI analysis
* Missing location
* Invalid input
* Image upload
* Image upload error
* No complaints
* No search results

For AI errors, show a friendly message such as:

“CivicLens couldn't confidently identify this issue. Please provide a little more detail or upload a photo.”

---

# 24. Sample Demo Scenario

Use this as the main example throughout the prototype:

Citizen input:

“There has been garbage piling up outside my college for five days.”

Uploaded photo:

Garbage accumulation.

AI result:

Issue:
Garbage accumulation

Category:
Sanitation

Severity:
High

Duration:
5 days

Department:
Municipal Sanitation Department

Safety Risk:
Moderate

Priority:
High

Location:
Block B, XYZ Road

AI explanation:

“The waste has remained uncollected for five days in a public area, which may create hygiene and public-health risks.”

Generated Case ID:

**CL-10482**

---

# 25. Important Product Principles

CivicLens should NOT look like a chatbot.

The primary experience should be:

**Citizen → Report → AI Analysis → Structured Complaint → Submit → Track**

The AI is an intelligent layer inside the application.

The UI should make the AI's decisions understandable through concise explanations and visible factors.

Do not create unnecessary screens or features.

Prioritize the core civic-reporting experience.

---

# 26. Technical Frontend Requirements

Generate the frontend as a real functional web application rather than only static mockups.

Use:

* React
* TypeScript
* Tailwind CSS
* Component-based architecture
* Reusable components
* Responsive layouts
* Clean routing structure

Use realistic mock data for now.

Important:

**Do not implement the real backend, database, authentication, Gemini API, or government API integration yet.**

Use mock data and mock interactions for the prototype.

However, structure the frontend cleanly so that the mock data and UI actions can later be replaced with:

* Node.js + Express backend
* MongoDB Atlas
* Gemini API
* JWT authentication
* Leaflet/OpenStreetMap
* Real complaint APIs

Do not hardcode the entire application into one component.

Create reusable components such as:

* Navbar
* Sidebar
* ComplaintCard
* StatusBadge
* PriorityBadge
* AnalysisCard
* EvidenceCard
* MapPanel
* InsightCard
* Timeline
* Button
* Modal
* Toast
* FormInput

---

# 27. Final Quality Requirement

The final result should look like a **real startup/hackathon product that could be demonstrated to judges**.

It should feel polished enough that someone seeing the application for the first time immediately understands:

**“I report a civic problem, CivicLens understands it, routes it, generates the complaint, and lets me track it.”**

Prioritize visual polish, usability, accessibility, responsive design, realistic data, and a convincing end-to-end prototype.

Do not overcomplicate the interface.

The most important screens are:

1. Report Issue
2. AI Analysis
3. Generated Complaint
4. Case Tracking
5. Admin Dashboard
6. Civic Issue Map
7. AI Civic Insights
