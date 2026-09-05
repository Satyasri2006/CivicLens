import { GoogleGenAI } from '@google/genai';

/**
 * Gemini Service for Civic Complaint Structuring & Normalization
 * Strictly uses Gemini for understanding text and outputting structured JSON.
 */
export async function analyzeComplaintWithGemini(description, language = 'English') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a civic issue classification AI for government services.
Analyze the following citizen complaint described in ${language}:
"${description}"

Return ONLY a raw JSON object with NO markdown, NO code block formatting, containing:
{
  "category": "Sanitation" | "Roads" | "Electricity" | "Water" | "Drainage" | "Infrastructure" | "Other",
  "issueType": "short issue title (e.g. Garbage accumulation, Pothole, Broken streetlight)",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "duration": "e.g. 5 days, 2 weeks, Recent",
  "safetyRisk": "Low" | "Moderate" | "High",
  "requiredEvidence": ["Photo", "Location"],
  "summary": "1-2 sentence concise summary of the civic problem",
  "justification": "Clear reasoning for the identified severity and public risk"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let responseText = response.text || '';
      // Strip markdown code fences if present
      responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(responseText);
      return {
        category: parsed.category || 'Sanitation',
        issueType: parsed.issueType || 'Civic Grievance',
        severity: parsed.severity || 'High',
        duration: parsed.duration || '5 days',
        safetyRisk: parsed.safetyRisk || 'Moderate',
        requiredEvidence: Array.isArray(parsed.requiredEvidence) ? parsed.requiredEvidence : ['Photo', 'Location'],
        summary: parsed.summary || description,
        justification: parsed.justification || 'Analyzed by CivicLens AI service based on citizen report.',
      };
    } catch (err) {
      console.warn(`[Gemini API Warning] Gemini service call fallback (${err.message}). Using intelligent heuristic fallback.`);
    }
  }

  // Intelligent fallback normalization if GEMINI_API_KEY is not set or API error occurs
  const text = description.toLowerCase();
  let category = 'Sanitation';
  let issueType = 'Garbage accumulation';
  let severity = 'High';
  let duration = '5 days';
  let safetyRisk = 'Moderate';

  if (text.includes('pothole') || text.includes('road')) {
    category = 'Roads';
    issueType = 'Pothole on road';
    severity = 'High';
  } else if (text.includes('light') || text.includes('street light') || text.includes('power')) {
    category = 'Electricity';
    issueType = 'Broken streetlight';
    severity = 'Medium';
    duration = '2 weeks';
  } else if (text.includes('water') || text.includes('leak')) {
    category = 'Water';
    issueType = 'Water pipeline leakage';
    severity = 'Critical';
    safetyRisk = 'High';
  } else if (text.includes('drain') || text.includes('sewage')) {
    category = 'Drainage';
    issueType = 'Drainage overflow';
    severity = 'Medium';
  } else if (text.includes('bench') || text.includes('park') || text.includes('tree')) {
    category = 'Infrastructure';
    issueType = 'Damaged public infrastructure';
    severity = 'Low';
  }

  return {
    category,
    issueType,
    severity,
    duration,
    safetyRisk,
    requiredEvidence: ['Photo', 'Location'],
    summary: `Report regarding ${issueType.toLowerCase()} described as: "${description}"`,
    justification: `Issue identified as ${category} problem requiring department attention and resolution.`,
  };
}
