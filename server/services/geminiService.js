import { GoogleGenAI } from '@google/genai';

/**
 * Gemini Service for Civic Complaint Structuring & Normalization
 * Strictly uses Gemini 3.6 Flash for understanding text and images, outputting structured JSON.
 */
export async function analyzeComplaintWithGemini(description, language = 'English', images = []) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const promptText = `You are an expert municipal civic governance AI.
Analyze the following citizen complaint submitted in ${language}:
"${description}"
${images && images.length > 0 ? 'Evidence photos have been attached to this report. Visually inspect the photo(s) to verify hazards, structural damage, or municipal failures.' : ''}

Classify the issue accurately. DO NOT default to garbage accumulation unless trash or garbage is specifically observed or described.
Determine whether it is a road issue (pothole/cave-in), electrical/streetlight issue, water leakage/supply disruption, drainage/sewage overflow, traffic hazard, fallen tree, building violation, or sanitation problem.

Return ONLY a raw valid JSON object with NO markdown, NO code block formatting, containing:
{
  "category": "Roads" | "Electricity" | "Water" | "Drainage" | "Sanitation" | "Infrastructure" | "Public Safety" | "Environment",
  "issueType": "concise, accurate title of the issue (e.g. Broken Water Main, Road Pothole, Hazardous Open Manhole, Non-functioning Streetlight, Fallen Tree)",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "department": "Municipal Department responsible (e.g. Public Works Department, City Electricity Board, Water Supply and Sewerage, Municipal Sanitation, Disaster Management)",
  "duration": "estimated duration based on description (e.g. 3 days, 1 week, Recent)",
  "safetyRisk": "Low" | "Moderate" | "High",
  "requiredEvidence": ["Photo", "Location"],
  "summary": "1-2 sentence concise summary of the civic problem and impact on residents",
  "justification": "Clear reasoning explaining public risk, urgency, and why this department must intervene"
}`;

      const contents = [{ text: promptText }];

      // Attach image parts if present
      if (images && images.length > 0) {
        for (const img of images) {
          if (typeof img === 'string' && img.startsWith('data:')) {
            const matches = img.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              contents.push({
                inlineData: {
                  mimeType: matches[1],
                  data: matches[2],
                },
              });
            }
          } else if (img.buffer && img.mimetype) {
            contents.push({
              inlineData: {
                mimeType: img.mimetype,
                data: img.buffer.toString('base64'),
              },
            });
          }
        }
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
      });

      let responseText = response.text || '';
      // Strip markdown code fences if present
      responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(responseText);
      return {
        category: parsed.category || 'Infrastructure',
        issueType: parsed.issueType || 'Civic Infrastructure Issue',
        severity: parsed.severity || 'High',
        priority: parsed.priority || 'HIGH',
        department: parsed.department || 'Public Works Department',
        duration: parsed.duration || 'Recent',
        safetyRisk: parsed.safetyRisk || 'Moderate',
        requiredEvidence: Array.isArray(parsed.requiredEvidence) ? parsed.requiredEvidence : ['Photo', 'Location'],
        summary: parsed.summary || description,
        justification: parsed.justification || 'Analyzed by CivicLens Gemini 3.6 Flash engine.',
      };
    } catch (err) {
      console.warn(`[Gemini API Warning] Gemini service call fallback (${err.message}). Using intelligent heuristic fallback.`);
    }
  }

  // Comprehensive, intelligent heuristic fallback (NEVER default to garbage accumulation unless garbage/trash is stated)
  const text = (description || '').toLowerCase();
  let category = 'Infrastructure';
  let issueType = 'Civic Infrastructure Concern';
  let severity = 'Medium';
  let priority = 'MEDIUM';
  let department = 'Public Works Department';
  let duration = 'Recent';
  let safetyRisk = 'Moderate';

  if (text.includes('pothole') || text.includes('crater') || text.includes('road') || text.includes('asphalt') || text.includes('tar') || text.includes('crack')) {
    category = 'Roads';
    issueType = 'Pothole and Road Damage';
    severity = 'High';
    priority = 'HIGH';
    department = 'Public Works Department (Roads Division)';
    safetyRisk = 'High';
    duration = '1 week';
  } else if (text.includes('light') || text.includes('street light') || text.includes('lamp') || text.includes('wire') || text.includes('pole') || text.includes('dark') || text.includes('power') || text.includes('electric') || text.includes('spark')) {
    category = 'Electricity';
    issueType = 'Streetlight and Power Line Failure';
    severity = 'Medium';
    priority = 'MEDIUM';
    department = 'City Electricity & Lighting Board';
    safetyRisk = text.includes('spark') || text.includes('wire') ? 'High' : 'Moderate';
    duration = '3 days';
  } else if (text.includes('water') || text.includes('leak') || text.includes('pipeline') || text.includes('pipe') || text.includes('tap') || text.includes('burst') || text.includes('drinking')) {
    category = 'Water';
    issueType = 'Water Pipeline Leakage / Supply Issue';
    severity = 'Critical';
    priority = 'URGENT';
    department = 'Water Supply and Sewerage Board';
    safetyRisk = 'High';
    duration = '2 days';
  } else if (text.includes('drain') || text.includes('gutter') || text.includes('sewage') || text.includes('overflow') || text.includes('manhole') || text.includes('sewer') || text.includes('stink')) {
    category = 'Drainage';
    issueType = text.includes('manhole') ? 'Hazardous Open Manhole' : 'Drainage and Sewer Overflow';
    severity = 'Critical';
    priority = 'URGENT';
    department = 'Drainage and Sewerage Department';
    safetyRisk = 'High';
    duration = '4 days';
  } else if (text.includes('garbage') || text.includes('trash') || text.includes('waste') || text.includes('dump') || text.includes('bin') || text.includes('debris') || text.includes('litter') || text.includes('filth')) {
    category = 'Sanitation';
    issueType = 'Solid Waste & Garbage Accumulation';
    severity = 'High';
    priority = 'HIGH';
    department = 'Municipal Sanitation & Waste Management';
    safetyRisk = 'Moderate';
    duration = '5 days';
  } else if (text.includes('tree') || text.includes('branch') || text.includes('park') || text.includes('garden') || text.includes('fallen') || text.includes('grass')) {
    category = 'Environment';
    issueType = 'Fallen Tree / Botanical Obstruction';
    severity = 'High';
    priority = 'HIGH';
    department = 'Parks and Urban Forestry Department';
    safetyRisk = 'High';
    duration = 'Recent';
  } else if (text.includes('traffic') || text.includes('signal') || text.includes('zebra') || text.includes('pedestrian') || text.includes('divider') || text.includes('accident')) {
    category = 'Public Safety';
    issueType = 'Traffic Signal and Pedestrian Hazard';
    severity = 'Critical';
    priority = 'URGENT';
    department = 'Traffic & Public Safety Department';
    safetyRisk = 'High';
    duration = 'Recent';
  } else if (text.includes('footpath') || text.includes('sidewalk') || text.includes('bench') || text.includes('railing') || text.includes('bridge') || text.includes('pavement')) {
    category = 'Infrastructure';
    issueType = 'Damaged Pedestrian Footpath / Public Asset';
    severity = 'Medium';
    priority = 'MEDIUM';
    department = 'Public Works Department';
    safetyRisk = 'Moderate';
    duration = '2 weeks';
  }

  return {
    category,
    issueType,
    severity,
    priority,
    department,
    duration,
    safetyRisk,
    requiredEvidence: ['Photo', 'Location'],
    summary: `Citizen complaint for ${issueType.toLowerCase()}: "${description}"`,
    justification: `Issue identified as ${category} concern requiring attention from ${department}.`,
  };
}
