
export type AtsIssue = { 
  id: string; 
  severity: 'high' | 'med' | 'low'; 
  path: string; 
  issue: string; 
  whyItMatters: string; 
  suggestion: string 
};

export type AtsResult = {
  total: number;
  breakdown: { format: number; content: number; relevance: number };
  missingKeywords: string[];
  issues: AtsIssue[];
};

export type ResumeData = {
  profile: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    headline?: string;
    links?: string[];
  };
  experience: Array<{
    id: string;
    role: string;
    company: string;
    start: string;
    end?: string;
    bullets: Array<{ id: string; text: string }>;
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    start: string;
    end?: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level?: 'basic' | 'intermediate' | 'advanced' | 'expert';
  }>;
  certifications?: string[];
  achievements?: string[];
};

// Extract all text content from resume data
export function extractText(resumeData: ResumeData): string {
  const parts: string[] = [];
  
  // Profile info
  parts.push(resumeData.profile.fullName);
  parts.push(resumeData.profile.email);
  if (resumeData.profile.headline) parts.push(resumeData.profile.headline);
  
  // Experience
  if (resumeData.experience && Array.isArray(resumeData.experience)) {
    resumeData.experience.forEach(exp => {
      parts.push(exp.role);
      parts.push(exp.company);
      if (exp.bullets && Array.isArray(exp.bullets)) {
        exp.bullets.forEach(bullet => parts.push(bullet.text));
      }
    });
  }
  
  // Education
  if (resumeData.education && Array.isArray(resumeData.education)) {
    resumeData.education.forEach(edu => {
      parts.push(edu.school);
      parts.push(edu.degree);
    });
  }
  
  // Skills
  if (resumeData.skills && Array.isArray(resumeData.skills)) {
    resumeData.skills.forEach(skill => parts.push(skill.name));
  }
  
  // Certifications and achievements
  if (resumeData.certifications) {
    resumeData.certifications.forEach(cert => parts.push(cert));
  }
  if (resumeData.achievements) {
    resumeData.achievements.forEach(achievement => parts.push(achievement));
  }
  
  return parts.join(' ').toLowerCase();
}

// Extract keywords from job description using tf-idf-like approach
export function extractKeywords(jobText: string): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'do', 'does', 'did', 'get',
    'got', 'make', 'made', 'take', 'took', 'come', 'came', 'go', 'went', 'see', 'saw',
    'know', 'knew', 'think', 'thought', 'say', 'said', 'tell', 'told', 'ask', 'asked',
    'work', 'worked', 'use', 'used', 'find', 'found', 'give', 'gave', 'put', 'took',
    'year', 'years', 'team', 'company', 'role', 'position', 'job', 'opportunity'
  ]);

  const words = jobText
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));

  // Count frequencies
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30)
    .map(([word]) => word);
}

// Score format aspects (max 20 points)
export function scoreFormat(resumeData: ResumeData): { score: number; issues: AtsIssue[] } {
  const issues: AtsIssue[] = [];
  let score = 20;

  // Check contact info (4 points)
  if (!resumeData.profile.email) {
    score -= 2;
    issues.push({
      id: 'missing-email',
      severity: 'high' as const,
      path: 'profile.email',
      issue: 'Missing email address',
      whyItMatters: 'ATS systems require contact information to process applications',
      suggestion: 'Add your professional email address'
    });
  }
  if (!resumeData.profile.phone) {
    score -= 1;
    issues.push({
      id: 'missing-phone',
      severity: 'med' as const,
      path: 'profile.phone',
      issue: 'Missing phone number',
      whyItMatters: 'Recruiters need multiple ways to contact you',
      suggestion: 'Add your phone number'
    });
  }
  if (!resumeData.profile.location) {
    score -= 1;
    issues.push({
      id: 'missing-location',
      severity: 'low' as const,
      path: 'profile.location',
      issue: 'Missing location',
      whyItMatters: 'Location helps with local job matching',
      suggestion: 'Add your city and state'
    });
  }

  // Check section presence (4 points)
  if (!resumeData.experience || resumeData.experience.length === 0) {
    score -= 2;
    issues.push({
      id: 'missing-experience',
      severity: 'high' as const,
      path: 'experience',
      issue: 'No work experience listed',
      whyItMatters: 'Experience section is critical for most positions',
      suggestion: 'Add at least one work experience entry'
    });
  }
  if (!resumeData.skills || resumeData.skills.length === 0) {
    score -= 1;
    issues.push({
      id: 'missing-skills',
      severity: 'med' as const,
      path: 'skills',
      issue: 'No skills listed',
      whyItMatters: 'Skills help ATS match you to relevant positions',
      suggestion: 'Add relevant technical and soft skills'
    });
  }
  if (!resumeData.education || resumeData.education.length === 0) {
    score -= 1;
    issues.push({
      id: 'missing-education',
      severity: 'low' as const,
      path: 'education',
      issue: 'No education listed',
      whyItMatters: 'Many positions require educational background',
      suggestion: 'Add your educational qualifications'
    });
  }

  // Check bullet point length (8 points) - only if experience exists
  if (resumeData.experience && Array.isArray(resumeData.experience)) {
    resumeData.experience.forEach((exp, expIndex) => {
      if (exp.bullets && Array.isArray(exp.bullets)) {
        exp.bullets.forEach((bullet, bulletIndex) => {
      const wordCount = bullet.text.split(/\s+/).length;
      if (wordCount < 8) {
        score -= 1;
        issues.push({
          id: `bullet-too-short-${exp.id}-${bullet.id}`,
          severity: 'med' as const,
          path: `experience[${expIndex}].bullets[${bulletIndex}]`,
          issue: 'Bullet point too short',
          whyItMatters: 'Short bullets lack detail for ATS keyword matching',
          suggestion: `Expand this bullet point (currently ${wordCount} words, aim for 8-24)`
        });
      } else if (wordCount > 24) {
        score -= 0.5;
        issues.push({
          id: `bullet-too-long-${exp.id}-${bullet.id}`,
          severity: 'low' as const,
          path: `experience[${expIndex}].bullets[${bulletIndex}]`,
          issue: 'Bullet point too long',
          whyItMatters: 'Long bullets are harder for ATS to parse effectively',
          suggestion: `Shorten this bullet point (currently ${wordCount} words, aim for 8-24)`
        });
      }
        });
      }
    });
  }

  // Check dates presence (4 points) - only if experience exists
  if (resumeData.experience && Array.isArray(resumeData.experience)) {
    resumeData.experience.forEach((exp, index) => {
    if (!exp.start) {
      score -= 1;
      issues.push({
        id: `missing-start-date-${exp.id}`,
        severity: 'med' as const,
        path: `experience[${index}].start`,
        issue: 'Missing start date',
        whyItMatters: 'ATS systems use dates to verify work history',
        suggestion: 'Add the start date for this position'
      });
    }
    });
  }

  return { score: Math.max(0, score), issues };
}

// Score content quality (max 40 points)
export function scoreContent(resumeData: ResumeData): { score: number; issues: AtsIssue[] } {
  const issues: AtsIssue[] = [];
  let score = 40;

  const actionVerbs = [
    'achieved', 'built', 'created', 'developed', 'established', 'implemented',
    'improved', 'increased', 'led', 'managed', 'optimized', 'reduced', 'streamlined',
    'delivered', 'executed', 'launched', 'designed', 'analyzed', 'collaborated',
    'coordinated', 'facilitated', 'mentored', 'trained', 'automated', 'enhanced'
  ];

  const weakPhrases = [
    'responsible for', 'helped with', 'worked on', 'assisted in', 'participated in',
    'involved in', 'duties included', 'tasks included'
  ];

  const numberPattern = /\b\d+(\.\d+)?(%|k|m|b|\+|x|\.|,)?\b/i;
  const metricPattern = /(increased|decreased|improved|reduced|saved|generated|grew|boosted|cut|enhanced|optimized|streamlined).*?(\d+)/i;

  if (resumeData.experience && Array.isArray(resumeData.experience)) {
    resumeData.experience.forEach((exp, expIndex) => {
      if (exp.bullets && Array.isArray(exp.bullets)) {
        exp.bullets.forEach((bullet, bulletIndex) => {
      const text = bullet.text.toLowerCase();
      
      // Check for action verbs at start (10 points)
      const firstWord = text.split(' ')[0];
      const hasActionVerb = actionVerbs.some(verb => firstWord.includes(verb));
      if (!hasActionVerb) {
        score -= 2;
        issues.push({
          id: `weak-start-${exp.id}-${bullet.id}`,
          severity: 'med' as const,
          path: `experience[${expIndex}].bullets[${bulletIndex}]`,
          issue: 'Bullet doesn\'t start with action verb',
          whyItMatters: 'Action verbs make accomplishments more impactful and ATS-friendly',
          suggestion: `Start with an action verb like: ${actionVerbs.slice(0, 3).join(', ')}`
        });
      }

      // Check for quantified metrics (15 points)
      const hasNumbers = numberPattern.test(text);
      const hasMetrics = metricPattern.test(text);
      if (!hasNumbers && !hasMetrics) {
        score -= 3;
        issues.push({
          id: `no-metrics-${exp.id}-${bullet.id}`,
          severity: 'high' as const,
          path: `experience[${expIndex}].bullets[${bulletIndex}]`,
          issue: 'Missing quantified results',
          whyItMatters: 'Numbers and metrics demonstrate concrete impact',
          suggestion: 'Add specific numbers, percentages, or measurable outcomes'
        });
      }

      // Check for weak phrases (10 points)
      const hasWeakPhrase = weakPhrases.some(phrase => text.includes(phrase));
      if (hasWeakPhrase) {
        score -= 2;
        issues.push({
          id: `weak-phrase-${exp.id}-${bullet.id}`,
          severity: 'med' as const,
          path: `experience[${expIndex}].bullets[${bulletIndex}]`,
          issue: 'Contains weak phrasing',
          whyItMatters: 'Weak phrases make you sound passive rather than results-driven',
          suggestion: 'Replace with strong action verbs and specific accomplishments'
        });
      }

      // Check tense consistency (5 points)
      const currentJob = !exp.end;
      const hasPastTense = /\b(ed|d)\b/.test(text);
      const hasPresentTense = /\b(s|ing)\b/.test(text);
      
      if (currentJob && hasPastTense && !hasPresentTense) {
        score -= 1;
        issues.push({
          id: `tense-current-${exp.id}-${bullet.id}`,
          severity: 'low' as const,
          path: `experience[${expIndex}].bullets[${bulletIndex}]`,
          issue: 'Use present tense for current role',
          whyItMatters: 'Tense consistency helps ATS and recruiters understand your timeline',
          suggestion: 'Use present tense verbs for your current position'
        });
      } else if (!currentJob && hasPresentTense && !hasPastTense) {
        score -= 1;
        issues.push({
          id: `tense-past-${exp.id}-${bullet.id}`,
          severity: 'low' as const,
          path: `experience[${expIndex}].bullets[${bulletIndex}]`,
          issue: 'Use past tense for previous roles',
          whyItMatters: 'Tense consistency helps ATS and recruiters understand your timeline',
          suggestion: 'Use past tense verbs for previous positions'
        });
      }
        });
      }
    });
  }

  return { score: Math.max(0, score), issues };
}

// Score relevance to job description (max 40 points)
export function scoreRelevance(resumeData: ResumeData, jobText: string): { score: number; issues: AtsIssue[]; missingKeywords: string[] } {
  const issues: AtsIssue[] = [];
  const jobKeywords = extractKeywords(jobText);
  const resumeText = extractText(resumeData);
  
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  
  jobKeywords.forEach(keyword => {
    if (resumeText.includes(keyword)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });
  
  const matchRate = jobKeywords.length > 0 ? matchedKeywords.length / jobKeywords.length : 0;
  const score = Math.round(matchRate * 40);
  
  if (score < 20) {
    issues.push({
      id: 'low-keyword-match',
      severity: 'high' as const,
      path: 'general',
      issue: 'Low keyword relevance to job description',
      whyItMatters: 'ATS systems prioritize resumes with relevant keywords',
      suggestion: `Add more relevant keywords from the job description: ${missingKeywords.slice(0, 5).join(', ')}`
    });
  }
  
  return { score, issues, missingKeywords: missingKeywords.slice(0, 10) };
}

// Main evaluation function
export function evaluate(resumeData: ResumeData, jobText: string): AtsResult {
  const formatResult = scoreFormat(resumeData);
  const contentResult = scoreContent(resumeData);
  const relevanceResult = scoreRelevance(resumeData, jobText);
  
  const total = formatResult.score + contentResult.score + relevanceResult.score;
  const allIssues = [
    ...formatResult.issues,
    ...contentResult.issues,
    ...relevanceResult.issues
  ];
  
  return {
    total,
    breakdown: {
      format: formatResult.score,
      content: contentResult.score,
      relevance: relevanceResult.score
    },
    missingKeywords: relevanceResult.missingKeywords,
    issues: allIssues
  };
}
