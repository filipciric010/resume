# Resume Boost – AI Resume Builder

![CI](https://github.com/filipciric010/resume/actions/workflows/ci.yml/badge.svg)

Build polished, ATS‑friendly resumes with AI. Generate quantified bullets, tailor a cover letter, check ATS match, and export pixel‑perfect PDFs. Includes Stripe‑gated Pro features and Supabase auth.

• Live Demo: https://your-demo.example.com — click “Load Demo” on the Editor to try with sample data (no keys required).

## Screenshots

![Editor (Template Switch)](/og/editor.png)
![ATS Score Pane](/og/ats.png)
![AI Bullets Generator](/og/bullets.gif)
![Cover Letter Modal](/og/cover-letter.png)
![PDF Export](/og/export.png)

### Video Walkthrough
Loom: https://www.loom.com/share/your-video-id

## Features
- AI bullets generator (role/impact/tools → 3 quantified suggestions)
- AI cover letter (tailored to JD)
- ATS scoring + actionable fixes
- PDF export via headless Chrome (print CSS)
- Multiple templates (Classic, Modern, Compact)
- Stripe “Pro” unlock (Checkout + Webhook + entitlements)
- Google sign‑in (Supabase Auth)

## Tech Stack
- React 18, TypeScript, Vite
- Tailwind CSS, shadcn/ui, Lucide
- Node/Express, Puppeteer
- OpenAI API, Supabase
- Stripe (Checkout sessions + webhook)

## Quick Start (Docker Compose)

Dev with hot‑reload for web and server:

```bash
docker-compose up --build
```

Defaults:
- Web: http://localhost:5173
- Server API: http://localhost:3001 (Vite proxies /api → server)
- Demo mode on (VITE_DEMO=true). Click “Load Demo” on the Editor.

## Vercel Deployment (Demo Mode)

Deploy to Vercel with demo mode enabled (no configuration required):

1. Fork this repository
2. Connect to Vercel
3. Deploy - the `vercel.json` automatically enables demo mode
4. Your app will run with all features unlocked!

The included `vercel.json` sets `VITE_DEMO=true` automatically.

## Production Checklist
Set these before launch:

```bash
# Demo & client
VITE_DEMO=false

# OpenAI (server only)
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
APP_URL=https://your-domain
STRIPE_PRICE_ID=price_default # optional fallback
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_TEAMS=price_...
VITE_STRIPE_PRICE_PRO=price_...
VITE_STRIPE_PRICE_TEAMS=price_...

# Supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
CLIENT_ORIGIN=https://your-domain
PORT=3001
```

Ops notes:
- CORS: Set `CLIENT_ORIGIN` to a comma-separated list of allowed domains (no wildcard). The server enforces this list.
- Demo: Set `VITE_DEMO=false` in production; the UI hides demo helpers.
- Entitlements: In production, entitlements require Supabase (service role). JSON fallback is disabled.
- Webhooks: Configure `STRIPE_WEBHOOK_SECRET` per environment; rotate any test keys before going live.
- See `.env.production.example` for a complete template.

## Repo Structure

```text
.
├─ server/
│  ├─ index.mjs          # Express app (API, Stripe webhook, PDF)
│  ├─ aiRouter.mjs       # Unified AI endpoint
│  └─ ...
├─ src/
│  ├─ pages/             # Routes (Editor, ATS, Templates, etc.)
│  ├─ components/        # UI and sections (Pricing, Cover Letter, ATS)
│  ├─ lib/               # pay.ts, utils, supabase client
│  └─ store/             # Zustand stores
├─ public/               # Assets
├─ data/                 # entitlements.json (Stripe Pro)
├─ docker-compose.yml    # Dev: web + server
├─ Dockerfile            # Prod image
└─ .github/workflows/ci.yml
```

## Local Dev (npm)

```bash
npm install
npm run dev  # web on 5173, server on 3001
```

## License & Sale
This codebase is prepared for a full‑rights sale. Upon purchase, the seller will transfer all IP and provide a sale pack in `/sale` (handover docs, env templates, and deployment notes).

—
Questions? Open an issue or reach out about licensing/sale.
