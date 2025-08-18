import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import Stripe from 'stripe';
import aiRouter from './aiRouter.mjs';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Config
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:8080';
const ALLOWED_ORIGINS = CLIENT_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
const FETCH_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS || 20000);

// Middleware
app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
// IMPORTANT: We mount the Stripe webhook (raw body) BEFORE JSON parser below
app.use(morgan('tiny'));

// ===== Stripe integration =====
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || '';
const STRIPE_PRICE_PRO = process.env.STRIPE_PRICE_PRO || '';
const STRIPE_PRICE_TEAMS = process.env.STRIPE_PRICE_TEAMS || '';
const APP_URL = process.env.APP_URL || 'http://localhost:8080';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' }) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENTITLEMENTS_PATH = path.resolve(__dirname, '..', 'data', 'entitlements.json');
const EVENTS_PATH = path.resolve(__dirname, '..', 'data', 'stripe_events.json');

// Supabase (server-side)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || '';
const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;
const supabaseAnon = (SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

async function readEntitlements() {
  try {
    const buf = await fs.readFile(ENTITLEMENTS_PATH, 'utf8');
    return JSON.parse(buf);
  } catch (e) {
    // If not found, return empty map
    return {};
  }
}

async function writeEntitlements(obj) {
  const dir = path.dirname(ENTITLEMENTS_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(ENTITLEMENTS_PATH, JSON.stringify(obj, null, 2), 'utf8');
}

export async function getPro(userId) {
  if (!userId) return false;
  // Prefer Supabase if configured
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('entitlements')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data ? String(data.status).toLowerCase() === 'active' : false;
    } catch (e) {
      console.warn('[entitlements] supabase getPro failed, falling back to JSON:', e?.message || e);
    }
  }
  const ent = await readEntitlements();
  const rec = ent[userId];
  return rec === true || (rec && (rec.status === 'active' || rec.pro === true));
}

async function upsertEntitlement({ userId, status = 'active', priceId = '', stripeCustomerId = '', currentPeriodEnd = null }) {
  if (!userId) return;
  if (supabaseAdmin) {
    try {
      const payload = { user_id: userId, status, price_id: priceId || null, stripe_customer_id: stripeCustomerId || null, current_period_end: currentPeriodEnd };
      const { error } = await supabaseAdmin.from('entitlements').upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('[entitlements] supabase upsert failed, falling back to JSON:', e?.message || e);
    }
  }
  const map = await readEntitlements();
  map[userId] = { pro: status === 'active', status, priceId, stripeCustomerId, currentPeriodEnd };
  await writeEntitlements(map);
}

async function setProJSON(userId, pro) {
  const map = await readEntitlements();
  map[userId] = pro;
  await writeEntitlements(map);
}

async function readProcessedEvents() {
  try {
    const buf = await fs.readFile(EVENTS_PATH, 'utf8');
    const obj = JSON.parse(buf);
    return new Set(Array.isArray(obj) ? obj : obj.ids || []);
  } catch {
    return new Set();
  }
}

async function writeProcessedEvents(set) {
  const dir = path.dirname(EVENTS_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(EVENTS_PATH, JSON.stringify(Array.from(set)), 'utf8');
}

// Optional auth: verify Supabase JWT; set req.userId if valid
async function authenticate(req, _res, next) {
  try {
    const hdr = req.get('authorization') || req.get('Authorization');
    const token = hdr && hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
    if (!token || !supabaseAnon) return next();
    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (!error && data?.user?.id) {
      req.userId = data.user.id;
    }
  } catch (e) {
    // ignore
  }
  return next();
}

// Webhook must use raw body
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }
  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).json({ error: 'Missing Stripe signature' });
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);

    // Idempotency guard
    const processed = await readProcessedEvents();
    if (processed.has(event.id)) {
      return res.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session?.metadata?.userId;
        const priceId = session?.line_items?.[0]?.price?.id || session?.metadata?.priceId || '';
        // If expand not enabled, rely on subscription retrieval later
        const stripeCustomerId = (session?.customer && typeof session.customer === 'string') ? session.customer : '';
        if (userId) {
          await upsertEntitlement({ userId, status: 'active', priceId, stripeCustomerId });
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object;
        const status = sub?.status || 'active';
        const priceId = sub?.items?.data?.[0]?.price?.id || '';
        const stripeCustomerId = (sub?.customer && typeof sub.customer === 'string') ? sub.customer : '';
        // Attempt to recover our userId via metadata on latest_invoice or stored mapping
        const userId = sub?.metadata?.userId || '';
        if (userId) {
          await upsertEntitlement({ userId, status, priceId, stripeCustomerId, currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = sub?.metadata?.userId || '';
        const priceId = sub?.items?.data?.[0]?.price?.id || '';
        const stripeCustomerId = (sub?.customer && typeof sub.customer === 'string') ? sub.customer : '';
        if (userId) {
          await upsertEntitlement({ userId, status: 'canceled', priceId, stripeCustomerId });
        }
        break;
      }
      default: {
        // ignore
      }
    }

    processed.add(event.id);
    await writeProcessedEvents(processed);
    return res.json({ received: true });
  } catch (err) {
    console.error('[stripe] webhook error:', err?.message || err);
    return res.status(400).json({ error: 'Webhook Error', details: String(err?.message || err) });
  }
});

// JSON parser comes AFTER the webhook to keep raw body available there
app.use(express.json({ limit: '2mb' }));
app.use(authenticate);

const limiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
app.use('/api/', limiter);
// Mount unified AI router
app.use('/api/ai', aiRouter);

// Create Checkout Session (supports dynamic priceId and optional redirect paths)
// body: { priceId?: string, userId?: string, successPath?: string, cancelPath?: string }
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ error: 'Stripe not configured' });
    const { priceId, userId: userIdBody, successPath = '/pricing?success=1', cancelPath = '/pricing?canceled=1' } = req.body || {};

    const allowedPrices = [STRIPE_PRICE_ID, STRIPE_PRICE_PRO, STRIPE_PRICE_TEAMS].filter(Boolean);
    const requested = String(priceId || STRIPE_PRICE_ID || '').trim();
    if (!requested) return res.status(400).json({ error: 'Missing priceId' });
    if (allowedPrices.length && !allowedPrices.includes(requested)) {
      return res.status(400).json({ error: 'Invalid priceId' });
    }

    const effectivePriceId = requested;
    const userId = req.userId || (userIdBody ? String(userIdBody) : undefined);

    const session = await stripe.checkout.sessions.create({
      // Use subscription by default; switch to 'payment' if you prefer one-time
      mode: 'subscription',
      line_items: [
        { price: effectivePriceId, quantity: 1 },
      ],
      success_url: `${APP_URL}${successPath}`,
      cancel_url: `${APP_URL}${cancelPath}`,
      client_reference_id: userId || undefined,
      metadata: userId ? { userId: String(userId), priceId: effectivePriceId } : { priceId: effectivePriceId },
    });
    return res.json({ url: session.url });
  } catch (e) {
    console.error('[stripe] create session failed:', e);
    return res.status(500).json({ error: 'Failed to create checkout session', details: String(e?.message || e) });
  }
});

// Entitlement check
app.get('/api/pro/me', async (req, res) => {
  try {
  const userId = req.userId || '';
    const pro = await getPro(userId);
    return res.json({ pro });
  } catch (e) {
    return res.json({ pro: false });
  }
});

// PDF generation endpoint
const pdfRequestSchema = z.object({
  resumeData: z.object({
    profile: z.object({ fullName: z.string().min(1) }).passthrough(),
  }).passthrough(),
  templateKey: z.string().optional(),
  clientOrigin: z.string().optional(),
});

function resolveAllowedOrigin(req, requested) {
  const headerOrigin = req.get('origin');
  if (requested && ALLOWED_ORIGINS.includes(requested)) return requested;
  if (headerOrigin && ALLOWED_ORIGINS.includes(headerOrigin)) return headerOrigin;
  return ALLOWED_ORIGINS[0];
}

app.post('/api/pdf', async (req, res) => {
  try {
    const parsed = pdfRequestSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const { resumeData, templateKey, clientOrigin } = parsed.data;

  const payload = { resumeData, templateKey };
  const origin = resolveAllowedOrigin(req, typeof clientOrigin === 'string' ? clientOrigin : undefined);
  const url = `${origin}/print`;
  console.log('[PDF] Using client origin:', origin);
  console.log('[PDF] Navigating to:', url);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--no-zygote',
        '--disable-dev-shm-usage',
      ],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((pl) => {
      window.__PRINT_PAYLOAD__ = pl;
    }, payload);
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
  await page.emulateMediaType('print');
  await page.setCacheEnabled(false);
  await page.setDefaultNavigationTimeout(30000);
  await page.setDefaultTimeout(20000);
  // Restrict network requests to the allowed origin only
  if (process.env.NODE_ENV === 'production') {
    await page.setRequestInterception(true);
    const allowedHost = new URL(origin).host;
    page.on('request', (request) => {
      const reqUrl = request.url();
      try {
        // Allow same host across http/https/ws/wss, and allow data/blob/about URLs
        if (reqUrl.startsWith('data:') || reqUrl.startsWith('blob:') || reqUrl === 'about:blank') {
          return request.continue();
        }
        const u = new URL(reqUrl);
        if (u.host === allowedHost) {
          return request.continue();
        }
      } catch {}
      return request.abort();
    });
  }
  // In dev, HMR/websockets can keep connections open; rely on DOM ready + our print-ready flag
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Wait for print-ready flag
  await page.waitForSelector('[data-print-ready="true"]', { timeout: 25000 });

    const pdfBuffer = await page.pdf({
      width: '210mm',
      height: '297mm',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      scale: 1,
      pageRanges: '',
    });

    await browser.close();

    if (!pdfBuffer || pdfBuffer.length < 1000) {
      console.error('[PDF] Generated PDF buffer too small:', pdfBuffer?.length);
      return res.status(500).json({ error: 'PDF generation produced empty output' });
    }
    const safeName = String(resumeData.profile.fullName || 'resume').replace(/[^a-z0-9-]+/gi, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation failed', err);
    res.status(500).json({ error: 'PDF generation failed', details: String(err?.message || err) });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ai: Boolean(OPENAI_API_KEY) });
});

// ===== AI Proxy Endpoints =====
const openAIUrl = 'https://api.openai.com/v1/chat/completions';

const atsAnalyzeSchema = z.object({
  resume: z.unknown(),
  jobText: z.string().max(4000).optional()
});

const suggestBulletsSchema = z.object({
  role: z.string().min(1),
  impact: z.string().min(1),
  tools: z.string().min(1),
  drafts: z.array(z.string().min(1)).max(10).optional(),
  jobText: z.string().max(4000).optional(),
});

const rewriteBulletSchema = z.object({
  bullet: z.string().min(1),
  jobText: z.string().max(2000).optional(),
});

const rewriteSummarySchema = z.object({
  summary: z.string().min(1),
  role: z.string().optional(),
  skills: z.array(z.string().min(1)).max(50).optional(),
  jobText: z.string().max(4000).optional(),
});

const coverLetterSchema = z.object({
  resumeData: z.unknown(),
  jobText: z.string().min(1).max(8000),
});

app.post('/api/ai/analyze', async (req, res) => {
  if (!OPENAI_API_KEY) return res.status(503).json({ error: 'AI not configured' });
  const parse = atsAnalyzeSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });
  try {
  const { resume, jobText } = parse.data;
  const system = `You are an ATS resume analyst. Evaluate how well a resume matches a job description.\n\nReturn VALID JSON ONLY (no code fences, no extra commentary) with this exact schema:\n{\n  "matchScore": number,             // Overall score from 0–100\n  "matchedSkills": [string],        // Skills present in both resume and job description\n  "missingSkills": [string],        // Skills required in job description but not found in resume (top 10 max)\n  "experienceAlignment": string,    // Short summary of whether experience matches requirements\n  "educationAlignment": string,     // Short summary of whether education matches requirements\n  "summaryFeedback": string,        // Feedback on the candidate’s professional summary\n  "issues": [string],               // Weaknesses, mismatches, or concerns for ATS screening (short, actionable)\n  "recommendations": [string]       // Concrete suggestions to improve ATS match (prioritized)\n}\n\nProcess:\n1) Identify role level and core requirements from the job text.\n2) Extract key resume details (experience, skills, education, summary).\n3) Compute matchScore (0–100) based on skills, experience relevance, and education fit.\n4) matchedSkills/missingSkills should come from relevant keywords in the JD (normalize casing, dedupe).\n5) Keep text fields concise (1–2 sentences). Maintain a professional, neutral tone.`;
    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: `ResumeData JSON:\n${JSON.stringify(resume)}` },
      ...(jobText ? [{ role: 'user', content: `Job Description:\n${jobText}` }] : [])
    ];
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  const resp = await fetch(openAIUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
  body: JSON.stringify({ model: OPENAI_MODEL, messages, temperature: 0.2, max_tokens: 900 }),
      signal: ctrl.signal,
    });
    const data = await resp.json();
    clearTimeout(to);
    if (!resp.ok) return res.status(502).json({ error: 'OpenAI error', details: data });
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: 'AI proxy failed', details: String(e) });
  }
});

const simpleJsonSchema = z.object({ any: z.any() }).passthrough();

app.post('/api/ai/suggest-bullets', async (req, res) => {
  if (!OPENAI_API_KEY) return res.status(503).json({ error: 'AI not configured' });
  try {
    const parse = suggestBulletsSchema.safeParse(req.body || {});
    if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });
    const { role, impact, tools, drafts, jobText } = parse.data;
    const prompt = `Generate 3 quantified, ATS-friendly bullets for ${role}. Impact: ${impact}. Tools: ${tools}. ${drafts?.length ? `Drafts: ${drafts.join('; ')}` : ''} ${jobText ? `JD: ${jobText.slice(0,500)}` : ''}\nReturn JSON array with {text, rationale}.`;
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const resp = await fetch(openAIUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert resume writer. Respond with JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
      signal: ctrl.signal,
    });
    const data = await resp.json();
    clearTimeout(to);
    if (!resp.ok) return res.status(502).json({ error: 'OpenAI error', details: data });
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: 'AI proxy failed', details: String(e) });
  }
});

app.post('/api/ai/rewrite-bullet', async (req, res) => {
  if (!OPENAI_API_KEY) return res.status(503).json({ error: 'AI not configured' });
  try {
    const parse = rewriteBulletSchema.safeParse(req.body || {});
    if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });
    const { bullet, jobText } = parse.data;
    const prompt = `Rewrite this bullet to be quantified and impactful; return JSON {text, rationale}.\nOriginal: "${bullet}"\n${jobText ? `JD: ${jobText.slice(0,300)}` : ''}`;
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const resp = await fetch(openAIUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert resume writer. Respond with JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
      signal: ctrl.signal,
    });
    const data = await resp.json();
    clearTimeout(to);
    if (!resp.ok) return res.status(502).json({ error: 'OpenAI error', details: data });
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: 'AI proxy failed', details: String(e) });
  }
});

app.post('/api/ai/rewrite-summary', async (req, res) => {
  if (!OPENAI_API_KEY) return res.status(503).json({ error: 'AI not configured' });
  try {
    const parse = rewriteSummarySchema.safeParse(req.body || {});
    if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });
  const { summary, role, skills, jobText } = parse.data;
  const prompt = `You are an expert resume writer.\n\nYour task: rewrite the candidate’s professional summary to make it polished, compelling, and tailored for resumes.\n\nStep-by-Step Process\n\nStep 1 – Identify Role Type:\nDetermine if the candidate is Entry-Level, Experienced Professional, Technical Role, or Career Changer.\n\nStep 2 – Extract Key Details:\n- Pull out relevant experience (years, industries, job functions).\n- Highlight core skills, certifications, or achievements mentioned.\n- Capture the candidate’s career goals if provided.\n\nStep 3 – Rewrite for Clarity & Impact:\n- Use confident, professional language.\n- Keep it 3–5 sentences max (about 40–100 words).\n- Emphasize skills, results, and value to an employer.\n- Tailor tone depending on the role type.\n- Do not invent new information — only enhance what’s given.\n\nExamples (style only, do not copy content):\nEntry-Level: Highly motivated and adaptable recent graduate... eager to apply strong communication and analytical skills.\nExperienced Professional: Results-oriented Sales Manager with 8+ years... proven ability to lead teams and exceed targets.\nTechnical Role: Experienced Data Analyst with a strong background in data mining and BI... translate complex data into insights.\nCareer Changer: Dedicated professional with 5+ years in customer service... eager to leverage transferable skills in [new industry].\n\nOutput requirements:\n- Return ONLY the rewritten summary as plain text.\n- No labels, no code blocks, no quotes, no prefixes like Before/After.\n- Professional, specific, ATS-friendly; include 1–2 concrete results where appropriate.\n\nContext:\nOriginal Summary:\n"""\n${summary}\n"""\nRole: ${role || ''}\nSkills: ${(skills || []).join(', ')}\n${jobText ? `Job Description (excerpt):\n${jobText.slice(0, 500)}` : ''}`;
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const resp = await fetch(openAIUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert resume writer. Respond with JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 500,
      }),
      signal: ctrl.signal,
    });
    const data = await resp.json();
    clearTimeout(to);
    if (!resp.ok) return res.status(502).json({ error: 'OpenAI error', details: data });

  // Normalize: ensure choices[0].message.content is clean text (no code fences/labels)
    try {
      const content = data?.choices?.[0]?.message?.content ?? '';
      const extractJson = (s) => {
        // Remove code fences and trim
        let t = String(s).replace(/^```[a-z]*\n?|```$/gim, '').trim();
        // Find first { and last }
        const start = t.indexOf('{');
        const end = t.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          t = t.slice(start, end + 1);
        }
        try { return JSON.parse(t); } catch { return null; }
      };
      const cleanText = (s) => {
        return String(s)
          .replace(/[\u201C\u201D]/g, '"')
          .replace(/^\s*["'`]+|["'`]+\s*$/g, '') // strip surrounding quotes/backticks
          .replace(/^\s*(before|after|and after|and before)\s*:?/gim, '')
          .replace(/^\s*[-*]\s*/gm, '')
          .replace(/\s+/g, ' ')
          .trim();
      };
      const parsed = extractJson(content);
      const normalized = (parsed && typeof parsed === 'object') ? parsed : { text: String(content || '') };
      const result = {
        text: cleanText(normalized.text || ''),
        ...(normalized.rationale ? { rationale: cleanText(normalized.rationale) } : {}),
      };
      if (!result.text) {
        result.text = 'Experienced professional with a track record of delivering measurable impact; adept at modern tools and best practices.';
      }
      // If client requests text, return text/plain
      const wantsText = (req.get('accept') || '').includes('text/plain');
      if (wantsText) {
        res.type('text/plain');
        return res.send(result.text);
      }
      // Otherwise, rewrap into OpenAI-like response with plain text content
      const wrapped = { ...data, choices: [{ message: { content: result.text } }] };
      return res.json(wrapped);
    } catch (e) {
      // Fall back to raw
      return res.json(data);
    }
  } catch (e) {
    return res.status(500).json({ error: 'AI proxy failed', details: String(e) });
  }
});

app.post('/api/ai/cover-letter', async (req, res) => {
  if (!OPENAI_API_KEY) return res.status(503).json({ error: 'AI not configured' });
  try {
    const parse = coverLetterSchema.safeParse(req.body || {});
    if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });
    const { resumeData, jobText } = parse.data;

    const system = `You are an expert cover letter writer. Always respond in valid JSON only with the following schema:\n\n{\n  "content": "string",   // Full cover letter text\n  "wordCount": number      // Total number of words in content\n}\n\nCover Letter Requirements\n\nStructure:\n- Header: Candidate’s name, email, phone, location (from ResumeData).\n- Date: Current date.\n- Hiring Manager Info: Use company name from Job Description (if hiring manager is not provided, use "Dear Hiring Manager").\n- Salutation: Formal greeting.\n- Introduction: State position applied for, how candidate found it, and a short personal pitch.\n\nMain Body:\n- Highlight most relevant skills, experiences, or projects from the candidate’s resume.\n- Directly connect them to job requirements.\n- Demonstrate understanding of company’s goals or industry.\n\nConclusion: Restate enthusiasm, summarize value, and express interest in interview.\nClosing: Professional closing phrase + candidate’s name.\n\nStyle:\n- Professional, concise (250–400 words).\n- Tailored to job description using relevant keywords.\n- Confident but not exaggerated.\n- Clear flow: opening → skills/fit → closing.\n\nAbsolutely no extra commentary outside the JSON.`;

    const user = `ResumeData JSON:\n${JSON.stringify(resumeData)}\n\nJob Description (may be truncated):\n${String(jobText || '').slice(0, 2000)}`;

    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const resp = await fetch(openAIUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.6,
        max_tokens: 900,
      }),
      signal: ctrl.signal,
    });
    const data = await resp.json();
    clearTimeout(to);
    if (!resp.ok) return res.status(502).json({ error: 'OpenAI error', details: data });

    // Normalize content to strict JSON {content, wordCount}
    const extractJson = (s) => {
      if (!s) return null;
      let t = String(s).replace(/^```[a-z]*\n?|```$/gim, '').trim();
      const start = t.indexOf('{');
      const end = t.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) t = t.slice(start, end + 1);
      try { return JSON.parse(t); } catch { return null; }
    };
    const countWords = (text) => (String(text).trim().match(/\b\w+\b/g) || []).length;

    const schema = z.object({ content: z.string().min(50), wordCount: z.number().int().positive().optional() });
    const rawContent = data?.choices?.[0]?.message?.content ?? '';
    let parsed = extractJson(rawContent) || { content: String(rawContent || '') };
    const safe = schema.safeParse(parsed);
    let out = safe.success ? safe.data : { content: String(parsed.content || rawContent || '') };
    const computed = countWords(out.content);
    out.wordCount = computed;

    // Keep OpenAI-like shape but ensure the message content is a JSON string of {content, wordCount}
    const wrapped = { ...data, choices: [{ message: { content: JSON.stringify(out) } }] };
    return res.json(wrapped);
  } catch (e) {
    return res.status(500).json({ error: 'AI proxy failed', details: String(e) });
  }
});

app.get('/', (_req, res) => {
  res.type('text/plain').send('PDF server is running. Try GET /api/health or POST /api/pdf');
});

// Static serve if dist exists (production)
try {
  const distPath = path.resolve(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} catch {}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`PDF server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('[server] failed to start:', err?.code || err?.message || err);
});

process.on('uncaughtException', (err) => {
  console.error('[fatal] uncaughtException:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[fatal] unhandledRejection:', reason);
});
