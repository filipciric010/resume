import express from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const aiRouter = express.Router();

// Stricter limit for the generate endpoint: 30 req/min per IP
const generateLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

const bodySchema = z.object({
  type: z.enum(['resume_bullets', 'cover_letter', 'ats_score']),
  payload: z.any(),
});

aiRouter.post('/generate', generateLimiter, async (req, res) => {
  try {
    const parsed = bodySchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const { type, payload } = parsed.data;

    // Demo mode: return mocked responses
    if (String(process.env.DEMO).toLowerCase() === 'true') {
      if (type === 'resume_bullets') {
        return res.json({ bullets: [
          'Increased deployment speed by 35% by automating CI/CD workflows using GitHub Actions and Docker.',
          'Optimized React components and caching to reduce Time to Interactive by 42% across key pages.',
          'Led migration to a typed API layer, cutting runtime errors by 60% and improving developer velocity.',
        ]});
      }
      if (type === 'cover_letter') {
        return res.json({ content: 'Dear Hiring Manager, I am excited to apply for the role. With a proven record of delivering measurable results, I bring strong technical skills and a collaborative mindset. I look forward to the opportunity to contribute to your team. Sincerely, Candidate Name.' });
      }
      if (type === 'ats_score') {
        return res.json({ score: 78, issues: ['Missing relevant cloud keywords', 'Inconsistent date formatting'], suggestions: ['Add AWS/GCP services used', 'Standardize date formats (MM/YYYY)'] });
      }
    }

    // Real mode: call OpenAI Chat Completions (do NOT expose key to client)
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
    if (!OPENAI_API_KEY) {
      return res.status(503).json({ error: 'AI not configured' });
    }

    const model = 'gpt-4o-mini';
    const openAIUrl = 'https://api.openai.com/v1/chat/completions';

    const messages = buildMessages(type, payload);

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 20000);
    const resp = await fetch(openAIUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model, messages, temperature: 0.5, max_tokens: 900 }),
      signal: ctrl.signal,
    });
    clearTimeout(timeout);
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return res.status(502).json({ error: 'OpenAI error', details: data });
    }
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: 'AI proxy failed', details: String(e?.message || e) });
  }
});

function buildMessages(type, payload) {
  if (type === 'resume_bullets') {
    const { role = '', impact = '', tools = '', drafts = [], jobText = '' } = payload || {};
    const prompt = `Generate 3 concise, quantified, ATS-friendly resume bullets for the role "${role}".\nImpact: ${impact}\nTools: ${tools}\n${drafts?.length ? `Drafts: ${drafts.join(' | ')}` : ''}\n${jobText ? `Job description (excerpt): ${String(jobText).slice(0,500)}` : ''}\nReturn JSON array under the key bullets only: {"bullets": ["...","...","..."]}.`;
    return [
      { role: 'system', content: 'You are an expert resume writer. Respond in JSON only.' },
      { role: 'user', content: prompt },
    ];
  }
  if (type === 'cover_letter') {
    const { resumeData = {}, jobText = '' } = payload || {};
    const prompt = `Write a professional cover letter (≤ 250 words) based on the following resume data and job description. Return JSON: {"content": string}.\nResumeData JSON:\n${JSON.stringify(resumeData)}\nJob Description (excerpt):\n${String(jobText).slice(0, 1200)}`;
    return [
      { role: 'system', content: 'You are an expert cover letter writer. Respond in JSON only.' },
      { role: 'user', content: prompt },
    ];
  }
  // ats_score
  const { resume = {}, jobText = '' } = payload || {};
  const prompt = `Evaluate ATS match between resume and job description. Return JSON only with {"score": 0-100, "issues": [string], "suggestions": [string]}.\nResumeData JSON:\n${JSON.stringify(resume)}\nJob Description:\n${String(jobText).slice(0, 1600)}`;
  return [
    { role: 'system', content: 'You are an ATS scoring assistant. Respond in JSON only.' },
    { role: 'user', content: prompt },
  ];
}

export default aiRouter;
