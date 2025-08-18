# Resume Boost — Sell Sheet

A polished, production-ready resume builder with AI-assisted writing, ATS analysis, and pixel-perfect PDF export.

## Highlights
- AI features (server-side): bullet suggestions, rewrites, summary, cover letter via OpenAI proxy
- ATS scoring and keyword analysis
- High-quality PDF export (server with Puppeteer, client fallback)
- Templates: Classic, Compact, Modern
- Auth/DB ready (Supabase client integration)
- Fully containerized; healthcheck; rate limiting; Helmet; CORS allowlist
- CI, lint, tests, and environment examples included

## Tech Stack
- Frontend: React 18, TypeScript, Vite, Tailwind, shadcn/ui (Radix), Zustand
- Backend: Node/Express, Puppeteer (headless Chromium)
- Integrations: OpenAI (server proxy), Supabase client
- DevOps: Docker, GitHub Actions CI, Vitest

## Security & Ops
- No client-side AI secrets; server proxy with validation, rate limits, and timeouts
- PDF SSRF protection via allowed-origin and network interception
- Non-root container, healthcheck, production build
- .env.example provided; docs updated

## Setup
- Development: `npm i` then `npm run dev` (client + server)
- Production: build `npm run build`, then run `node server/index.mjs` or use Docker
- ENV: see `.env.example` (OPENAI_API_KEY, CLIENT_ORIGIN, PORT, SUPABASE)

## What’s Included
- Source code with server and client
- Dockerfile and CI workflow
- Minimal test suite and lint config
- Documentation and example environment file

## Optional Next Steps
- Add Playwright E2E smoke
- Deeper Zod schemas per route (partially implemented)
- Code-splitting (manualChunks) to reduce bundle size

## License
- Repository includes a proprietary LICENSE placeholder suitable for asset/code sale. Buyer may replace post-purchase.
