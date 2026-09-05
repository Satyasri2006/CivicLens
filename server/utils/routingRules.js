/**
 * Controlled Civic Department Routing Rules
 * Maps raw keywords, categories, or AI suggestions to verified official departments.
 */
export function determineDepartment(category = '', issueType = '', description = '') {
  const text = `${category} ${issueType} ${description}`.toLowerCase();

  if (text.includes('garbage') || text.includes('waste') || text.includes('dumping') || text.includes('sanitation') || text.includes('trash') || text.includes('odor')) {
    return 'Municipal Sanitation Department';
  }
  if (text.includes('pothole') || text.includes('road') || text.includes('highway') || text.includes('asphalt') || text.includes('street damage')) {
    return 'Public Works Department';
  }
  if (text.includes('light') || text.includes('electricity') || text.includes('power') || text.includes('transformer') || text.includes('wiring') || text.includes('dark')) {
    return 'City Electricity Board';
  }
  if (text.includes('water') || text.includes('pipeline') || text.includes('leak') || text.includes('contamination') || text.includes('tap')) {
    return 'Water Supply Board';
  }
  if (text.includes('drain') || text.includes('sewer') || text.includes('overflow') || text.includes('gutter') || text.includes('stagnant')) {
    return 'Drainage & Sewage Department';
  }
  if (text.includes('park') || text.includes('bench') || text.includes('playground') || text.includes('tree') || text.includes('building')) {
    return 'Parks & Public Infrastructure Dept';
  }

  return 'General Administration Office';
}

/**
 * Deterministic Priority Calculator
 * Determines civic complaint priority (LOW, MEDIUM, HIGH, URGENT) based on simple application rules.
 */
export function calculatePriority(severity = '', safetyRisk = '', duration = '', description = '') {
  const text = `${severity} ${safetyRisk} ${duration} ${description}`.toLowerCase();

  // URGENT: Immediate safety risks or serious hazards
  if (
    severity.toLowerCase() === 'critical' ||
    safetyRisk.toLowerCase() === 'high' ||
    text.includes('burst') ||
    text.includes('fallen tree') ||
    text.includes('blocking road') ||
    text.includes('emergency') ||
    text.includes('hazard') ||
    text.includes('immediate danger')
  ) {
    return 'URGENT';
  }

  // HIGH: Prolonged issues (>3 days), public health risks, major road hazards
  if (
    severity.toLowerCase() === 'high' ||
    text.includes('5 days') ||
    text.includes('week') ||
    text.includes('health risk') ||
    text.includes('garbage') ||
    text.includes('pothole')
  ) {
    return 'HIGH';
  }

  // LOW: Minor cosmetic issues
  if (
    severity.toLowerCase() === 'low' ||
    text.includes('bench') ||
    text.includes('minor') ||
    text.includes('cosmetic') ||
    text.includes('paint')
  ) {
    return 'LOW';
  }

  // MEDIUM: Normal civic service issues
  return 'MEDIUM';
}
