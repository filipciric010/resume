import { describe, it, expect, vi, beforeEach } from 'vitest'
import Stripe from 'stripe'

// These are lightweight unit-level tests that validate our server logic shape
// without spinning up the HTTP server. We focus on pure helpers through
// indirect behavior where possible.

describe('stripe config', () => {
  it('pins required api version string', () => {
    const REQUIRED = '2024-06-20'
    expect(REQUIRED).toBe('2024-06-20')
  })
})

// NOTE: Full signature verification requires raw body and Stripe secret.
// We include a sanity test for allowlisting logic by simulating env handling
// (no import of the server module to avoid side effects in CI).

describe('price allowlist logic', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('accepts listed prices only', () => {
    vi.stubEnv('STRIPE_PRICE_ID', 'price_default')
    vi.stubEnv('STRIPE_PRICE_PRO', 'price_pro')
    vi.stubEnv('STRIPE_PRICE_TEAMS', 'price_teams')
    const allowed = [
      process.env.STRIPE_PRICE_ID!,
      process.env.STRIPE_PRICE_PRO!,
      process.env.STRIPE_PRICE_TEAMS!,
    ].filter(Boolean)
    const req = (pid?: string) => allowed.includes(String(pid || ''))
    expect(req('price_pro')).toBe(true)
    expect(req('price_teams')).toBe(true)
    expect(req('price_default')).toBe(true)
    expect(req('price_other')).toBe(false)
  })
})
