
/**
 * Utility functions for ATS (Applicant Tracking System) analysis
 */

export interface ATSKeyword {
  word: string;
  frequency: number;
  category: 'skill' | 'role' | 'industry' | 'general';
}

export interface ATSAnalysisResult {
  score: number;
  keywords: ATSKeyword[];
  missingKeywords: string[];
  recommendations: string[];
}

/**
 * Extracts keywords from job description
 */
export const extractKeywords = (jobDescription: string): ATSKeyword[] => {
  // Common ATS keywords by category
  const skillKeywords = [
    'javascript', 'react', 'node.js', 'python', 'java', 'sql', 'aws', 'docker',
    'kubernetes', 'typescript', 'mongodb', 'postgresql', 'redis', 'graphql',
    'rest api', 'microservices', 'ci/cd', 'git', 'agile', 'scrum'
  ];

  const roleKeywords = [
    'developer', 'engineer', 'architect', 'manager', 'lead', 'senior', 'junior',
    'analyst', 'consultant', 'specialist', 'coordinator', 'director'
  ];

  const words = jobDescription.toLowerCase().split(/\s+/);
  const keywordFreq: { [key: string]: number } = {};

  // Count keyword frequencies
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (skillKeywords.includes(cleanWord) || roleKeywords.includes(cleanWord)) {
      keywordFreq[cleanWord] = (keywordFreq[cleanWord] || 0) + 1;
    }
  });

  return Object.entries(keywordFreq).map(([word, frequency]) => ({
    word,
    frequency,
    category: skillKeywords.includes(word) ? 'skill' : 'role'
  }));
};

/**
 * Analyzes resume against job description for ATS compatibility
 */
type MinimalResume = { [key: string]: unknown };
export const analyzeATS = (resumeData: MinimalResume, jobDescription: string): ATSAnalysisResult => {
  const jobKeywords = extractKeywords(jobDescription);
  const resumeText = JSON.stringify(resumeData).toLowerCase();
  
  let matchedKeywords = 0;
  const missingKeywords: string[] = [];
  
  jobKeywords.forEach(keyword => {
    if (resumeText.includes(keyword.word)) {
      matchedKeywords++;
    } else {
      missingKeywords.push(keyword.word);
    }
  });

  const score = jobKeywords.length > 0 ? 
    Math.round((matchedKeywords / jobKeywords.length) * 100) : 0;

  const recommendations = generateRecommendations(score, missingKeywords);

  return {
    score,
    keywords: jobKeywords,
    missingKeywords,
    recommendations
  };
};

/**
 * Generates recommendations based on ATS analysis
 */
const generateRecommendations = (score: number, missingKeywords: string[]): string[] => {
  const recommendations: string[] = [];

  if (score < 70) {
    recommendations.push("Your resume needs significant improvement to pass ATS filters");
  }

  if (missingKeywords.length > 0) {
    recommendations.push(`Add these missing keywords: ${missingKeywords.slice(0, 5).join(', ')}`);
  }

  recommendations.push("Use standard section headers like 'Experience', 'Education', 'Skills'");
  recommendations.push("Avoid headers, footers, tables, and complex formatting");
  recommendations.push("Use bullet points for achievements and responsibilities");
  recommendations.push("Include relevant metrics and quantified results");

  return recommendations;
};

/**
 * Example unit test for the extractKeywords function
 */
export const testExtractKeywords = () => {
  const jobDesc = "We are looking for a React developer with Node.js experience";
  const keywords = extractKeywords(jobDesc);
  
  console.log("Testing extractKeywords function:");
  console.log("Input:", jobDesc);
  console.log("Output:", keywords);
  
  // Test assertions
  const hasReact = keywords.some(k => k.word === 'react');
  const hasNodejs = keywords.some(k => k.word === 'node.js');
  const hasDeveloper = keywords.some(k => k.word === 'developer');
  
  console.log("Tests passed:", hasReact && hasNodejs && hasDeveloper);
  
  return hasReact && hasNodejs && hasDeveloper;
};
