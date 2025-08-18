import { describe, it, expect, beforeAll, afterAll } from 'vitest'

// Lightweight integration sanity checks by spinning the server on a random port
// and probing a couple of endpoints with and without Authorization.

const PORT = 4011

describe('integration: pro check + webhook guards', () => {
  beforeAll(async () => {
    // Start the server child via dynamic import; it binds to process.env.PORT
    process.env.PORT = String(PORT)
    // Ensure Stripe is effectively disabled to avoid webhook signature needs
    process.env.STRIPE_SECRET_KEY = ''
    process.env.STRIPE_WEBHOOK_SECRET = ''
    await import('../server/index.mjs')
    // index.mjs already starts listening on import; wait briefly for bind
    await new Promise((r) => setTimeout(r, 250))
  })

  afterAll(async () => {
    // Best-effort: hit health; server remains running in test process lifespan
    await fetch(`http://localhost:${PORT}/api/health`).catch(() => {})
  })

  it('returns pro=false without Authorization header', async () => {
    const r = await fetch(`http://localhost:${PORT}/api/pro/me`)
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body).toHaveProperty('pro')
    expect(body.pro).toBe(false)
  })

  it('webhook guard responds 503 or 400 when Stripe not configured', async () => {
    const r = await fetch(`http://localhost:${PORT}/api/stripe/webhook`, { method: 'POST' })
    // When Stripe is not configured, server should reject with 503; some envs may report 400
    expect([400, 503]).toContain(r.status)
  })
})
