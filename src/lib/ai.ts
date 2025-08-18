import { ResumeData } from '@/store/useResume';
import type { AtsResult } from '@/lib/ats';

export type AtsNewResult = {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceAlignment: string;
  educationAlignment: string;
  summaryFeedback: string;
  issues: string[];
  recommendations: string[];
};

export interface SuggestBulletsRequest {
  role: string;
  impact: string;
  tools: string;
  drafts?: string[];
  jobText?: string;
}

export interface SuggestBulletsResponse {
  text: string;
  rationale: string;
}

export interface RewriteBulletRequest {
  bullet: string;
  jobText?: string;
}

export interface RewriteBulletResponse {
  text: string;
  rationale: string;
}

export interface CoverLetterRequest {
  resumeData: ResumeData;
  jobText: string;
}

export interface CoverLetterResponse {
  content: string;
  wordCount: number;
}

export interface RewriteSummaryRequest {
  summary: string;
  role?: string;
  skills?: string[];
  jobText?: string;
}

export interface RewriteSummaryResponse {
  text: string;
  rationale?: string;
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class AIService {
  private serverBase = '/api/ai';

  public isAvailable(): boolean {
    // Server decides actual availability via config; expose toggle for UI
    const flag = (import.meta.env.VITE_AI_ENABLED ?? 'true').toString();
    return flag !== 'false';
  }

  // Analyze resume against optional job description and return AtsResult
  async analyzeResume(resume: ResumeData, jobText?: string): Promise<AtsResult | AtsNewResult> {
    const schemaHint = `AtsResult JSON Schema (shape):
{
  "total": number, // 0..100
  "breakdown": { "format": number, "content": number, "relevance": number },
  "missingKeywords": string[],
  "issues": [
    {
      "id": string, // prefer known keys: missing-email | missing-phone | missing-location | missing-experience | missing-education | missing-skills | low-keyword-match | bullet-too-short-<expId>-<bulletId> | bullet-too-long-<expId>-<bulletId> | weak-start-<expId>-<bulletId> | no-metrics-<expId>-<bulletId> | weak-phrase-<expId>-<bulletId> | tense-current-<expId>-<bulletId> | tense-past-<expId>-<bulletId> | missing-start-date-<expId>
      "severity": "high" | "med" | "low",
      "path": string, // e.g. "profile.email" or "experience[0].bullets[1]" or "experience[0].start"
      "issue": string,
      "whyItMatters": string,
      "suggestion": string
    }
  ]
}`;

    const guidance = `Follow these rules strictly:
1) Use the schema exactly. Return JSON only.
2) Compute breakdown scores: format (0-20), content (0-40), relevance (0-40), and total = sum.
3) Only create issues that match the user's current data. If a field is present, don't mark it as missing.
4) Prefer the IDs listed in the schema comment so the client can auto-apply fixes.
5) For bullets, reference the exact exp and bullet index in 'path' and include expId/bulletId in the id suffix.
6) Keep suggestions concise and actionable.
7) Missing keywords: pick at most 10, prioritized by job text if provided.
8) If jobText is empty, set relevance to 0 and omit low-keyword-match unless clearly necessary.`;

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are an ATS resume analyst. Respond with JSON only. ${schemaHint}\n\n${guidance}`,
      },
      {
        role: 'user',
        content: `ResumeData JSON:\n${JSON.stringify(resume)}`,
      },
      ...(jobText ? [{ role: 'user' as const, content: `Job Description:\n${jobText}` }] : []),
    ];

    const response = await fetch(`${this.serverBase}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, jobText })
    });
    if (!response.ok) throw new Error('AI analyze failed');
    const raw = await response.json() as OpenAIResponse;
    const content = raw.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(content);
    // If new schema shape, return it as-is
    if (parsed && typeof parsed === 'object' && 'matchScore' in parsed) {
      const v = parsed as AtsNewResult;
      // Basic sanity defaults
      v.matchedSkills = Array.isArray(v.matchedSkills) ? v.matchedSkills : [];
      v.missingSkills = Array.isArray(v.missingSkills) ? v.missingSkills : [];
      v.issues = Array.isArray(v.issues) ? v.issues : [];
      v.recommendations = Array.isArray(v.recommendations) ? v.recommendations : [];
      return v;
    }
    // Fallback to legacy AtsResult shape
    if (!parsed || !parsed.breakdown || !Array.isArray(parsed.issues)) {
      throw new Error('Malformed ATS result');
    }
    return parsed as AtsResult;
  }

  async suggestBullets(request: SuggestBulletsRequest): Promise<SuggestBulletsResponse[]> {
    const prompt = this.buildBulletSuggestionPrompt(request);
    
    const resp = await fetch(`${this.serverBase}/suggest-bullets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!resp.ok) throw new Error('AI suggest bullets failed');
    const raw = await resp.json() as OpenAIResponse;
    const content = raw.choices[0].message.content;
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed.slice(0, 3) : [parsed];
    } catch {
      // Fallback if JSON parsing fails
      return [{
        text: content.split('\n')[0] || 'Failed to generate bullet point',
        rationale: 'Generated from AI response'
      }];
    }
  }

  async rewriteBullet(request: RewriteBulletRequest): Promise<RewriteBulletResponse> {
    const prompt = this.buildRewritePrompt(request);
    
    const resp = await fetch(`${this.serverBase}/rewrite-bullet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!resp.ok) throw new Error('AI rewrite bullet failed');
    const raw = await resp.json() as OpenAIResponse;
    const content = raw.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch {
      return {
        text: content,
        rationale: 'Rewritten to be more impactful and quantified'
      };
    }
  }

  async rewriteSummary(request: RewriteSummaryRequest): Promise<RewriteSummaryResponse> {
    const prompt = this.buildRewriteSummaryPrompt(request);

    const resp = await fetch(`${this.serverBase}/rewrite-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'text/plain, application/json' },
      body: JSON.stringify(request)
    });
    if (!resp.ok) {
      let detail = '';
      try {
        detail = (await resp.json())?.error || (await resp.text());
      } catch (e) {
        // ignore parse errors; we'll show a generic message
      }
      throw new Error(`AI rewrite summary failed${detail ? `: ${detail}` : ''}`);
    }
    const ct = resp.headers.get('content-type') || '';
    if (ct.includes('text/plain')) {
      const text = await resp.text();
      return { text };
    } else {
      const raw = await resp.json() as OpenAIResponse;
      const content = raw.choices[0].message.content;
      try {
        return JSON.parse(content);
      } catch {
        return { text: content };
      }
    }
  }

  async generateCoverLetter(request: CoverLetterRequest): Promise<CoverLetterResponse> {
    const prompt = this.buildCoverLetterPrompt(request);
    
    const resp = await fetch(`${this.serverBase}/cover-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!resp.ok) throw new Error('AI cover letter failed');
    const raw = await resp.json() as OpenAIResponse;
    const content = raw.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch {
      // Fallback if JSON parsing fails
      const wordCount = content.split(' ').length;
      return {
        content,
        wordCount
      };
    }
  }

  private buildBulletSuggestionPrompt(request: SuggestBulletsRequest): string {
    let prompt = `Generate 3 impactful resume bullet points for a ${request.role} role.

Key details:
- Role: ${request.role}
- Impact/Achievement: ${request.impact}
- Tools/Technologies: ${request.tools}`;

    if (request.drafts && request.drafts.length > 0) {
      prompt += `\n\nExisting drafts to improve upon:\n${request.drafts.map(d => `- ${d}`).join('\n')}`;
    }

    if (request.jobText) {
      prompt += `\n\nJob description context:\n${request.jobText.substring(0, 500)}...`;
    }

    prompt += `\n\nGenerate 3 bullet points that are:
- ATS-friendly with strong action verbs
- Quantified with specific numbers/percentages where possible
- Focused on achievements and impact
- Relevant to the role and technologies mentioned

Return as JSON array with objects containing 'text' and 'rationale' fields.`;

    return prompt;
  }

  private buildRewritePrompt(request: RewriteBulletRequest): string {
    let prompt = `Rewrite this resume bullet point to be more impactful:

Original: "${request.bullet}"`;

    if (request.jobText) {
      prompt += `\n\nJob description context:\n${request.jobText.substring(0, 300)}...`;
    }

    prompt += `\n\nImprove it by:
- Adding quantification (numbers, percentages, scale)
- Using stronger action verbs
- Making it more ATS-friendly
- Highlighting impact and results
- Keeping it concise and relevant

Return as JSON with 'text' and 'rationale' fields.`;

    return prompt;
  }

  private buildRewriteSummaryPrompt(request: RewriteSummaryRequest): string {
    const skillsLine = request.skills && request.skills.length > 0 ? request.skills.join(', ') : '';
    let prompt = `Rewrite this Professional Summary to be clearer, more impactful, and tailored for ATS:

Original Summary:
"""
${request.summary}
"""`;

    if (request.role) {
      prompt += `\n\nTarget Role: ${request.role}`;
    }
    if (skillsLine) {
      prompt += `\nKey Skills: ${skillsLine}`;
    }
    if (request.jobText) {
      prompt += `\nJob Description (context):\n${request.jobText.substring(0, 500)}...`;
    }

    prompt += `\n\nMake it:
- 2–4 sentences (about 40–80 words), first person implied, no "I".
- Start with a strong descriptor (e.g., "Senior Full-Stack Developer").
- Include 1–2 quantified achievements (numbers, %s, scale) where appropriate.
- Highlight 3–5 relevant skills/technologies and domain expertise.
- Avoid buzzwords, clichés, and fluff; keep it concrete and specific.
- ATS-friendly: include relevant keywords naturally.

Return JSON with {"text": string, "rationale"?: string}.`;

    return prompt;
  }

  private buildCoverLetterPrompt(request: CoverLetterRequest): string {
    const { resumeData, jobText } = request;

  const profile: Partial<ResumeData['profile']> = resumeData.profile ?? ({} as Partial<ResumeData['profile']>);
    const experience = resumeData.experience || [];
    const skills = resumeData.skills || [];
    const education = resumeData.education || [];

    // The jobText can include lines like: Company: X, Position: Y, RecipientName:, RecipientTitle:, CompanyAddress:
    // We'll pass it to the model as-is plus the structured resume context below.

    return `You are an expert career writer.
Create a polished, professional cover letter that follows THIS EXACT STRUCTURE and formatting. Output only JSON with keys {"content": string, "wordCount": number}.

STRUCTURE (must follow):
1) Header: Applicant name, city, phone, email, date; then recipient details (name/title/company/address). If recipient is missing, still include company and a generic line.
2) Greeting: Prefer a named person if provided, otherwise "Dear Hiring Manager,".
3) Opening Paragraph: State the role and where you found it, and why you’re interested in the role/company (show research).
4) Body Paragraph(s): Map 2–3 skills/experiences to key job requirements. Include 1–2 quantified achievements (e.g., increased X by Y%). Use concrete examples.
5) Closing Paragraph: Reaffirm fit, thank the reader, and add a polite call to action.
6) Signature: Full name.

STYLE AND FORMATTING:
- One page; 250 words or fewer.
- Professional, genuine tone; no buzzwords or fluff. Do not repeat resume verbatim—provide brief stories/examples.
- Use clean business letter format. Assume Arial/Helvetica 10–12pt (text only is fine).

APPLICANT (from resume):
Name: ${profile.fullName || ''}
Email: ${profile.email || ''}
Phone: ${profile.phone || ''}
City: ${profile.location || ''}
Headline: ${profile.headline || ''}
Links: ${(profile.links || []).join(', ')}

Experience:
${experience.map(exp => `- ${exp.role} at ${exp.company} (${exp.start} - ${exp.end || 'Present'})\n  ${(exp.bullets || []).map(b => `• ${b.text}`).join('\n  ')}`).join('\n')}

Skills: ${skills.map(s => s.name).join(', ')}
Education: ${education.map(e => `${e.degree} at ${e.school}`).join('; ')}

JOB DETAILS (paste may include company, position, recipient info, address):
${jobText.substring(0, 1400)}

RESPONSE REQUIREMENTS:
- Return valid JSON only with fields {"content", "wordCount"}.
- "content" must be the full cover letter ready to paste, including the header block, greeting, body, and close.
- Keep to ≤ 250 words.
- Use "Dear Hiring Manager," if no recipient name.
`;
  }
}

export const aiService = new AIService();
