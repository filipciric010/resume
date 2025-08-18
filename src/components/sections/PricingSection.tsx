import React from 'react';
import { startCheckout } from '@/lib/pay';
import { Check, Zap, Shield, Users } from 'lucide-react';

 type Tier = {
  id: 'free' | 'pro' | 'teams';
  name: string;
  tagline: string;
  price: string;
  cta: string;
  highlighted?: boolean;
  featureTitle?: string;
  features: string[];
  priceId?: string; // Stripe price for paid tiers
};

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Great to try the editor',
    price: '$0',
    cta: 'Start Free',
    features: [
      'Modern editor + live preview',
      '1 resume template',
      'Basic ATS check (demo)',
      'PDF export (watermark)',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Serious job hunters',
    price: '$9/mo', // or “$49 one-time” if you swap server to payment mode
    cta: 'Go Pro',
    highlighted: true,
    features: [
      'All templates + Pro pack',
      'Full ATS score + fixes',
      'AI bullet & cover letter',
      'Unlimited watermark-free exports',
      'Priority email support',
    ],
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO as string,
  },
  {
    id: 'teams',
    name: 'Teams',
    tagline: 'Hiring teams & bootcamps',
    price: '$29/mo',
    cta: 'Contact Sales',
    features: [
      'Seats (5) + admin dashboard',
      'Shared template library',
      'Usage analytics',
      'Priority support & SLA',
    ],
    priceId: import.meta.env.VITE_STRIPE_PRICE_TEAMS as string,
  },
];

function cls(...xs: (string | false | undefined)[]) {
  return xs.filter(Boolean).join(' ');
}

export default function PricingSection() {
  const handleClick = async (tier: Tier) => {
    if (tier.id === 'free') {
      // Scroll to editor or navigate
      document?.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!tier.priceId) return alert('Price not configured');
    await startCheckout(tier.priceId);
  };

  return (
    <section id="pricing" className="relative w-full py-24 bg-black text-white">
      {/* subtle grid background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-600/10 px-3 py-1 text-sm text-purple-300 ring-1 ring-purple-600/30">
            <Zap className="h-4 w-4" /> Pricing
          </div>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white">
            Simple plans, real results
          </h2>
          <p className="mt-3 text-neutral-300">
            Start free. Upgrade when you’re ready for AI and full ATS power.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.id}
              className={cls(
                'relative rounded-2xl border bg-neutral-900/60 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]',
                t.highlighted && 'border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.25)]'
              )}
            >
              {t.highlighted && (
                <div className="absolute -top-3 right-4 rounded-full bg-purple-600 px-3 py-1 text-xs font-medium shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-2 text-neutral-200">
                {t.id === 'free' && <Shield className="h-5 w-5 text-purple-400" />}
                {t.id === 'pro' && <Zap className="h-5 w-5 text-purple-400" />}
                {t.id === 'teams' && <Users className="h-5 w-5 text-purple-400" />}
                <span className="text-sm uppercase tracking-wider text-purple-300">{t.name}</span>
              </div>

              <h3 className="mt-2 text-2xl font-semibold text-white">{t.tagline}</h3>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{t.price}</span>
                <span className="text-sm text-neutral-400">Cancel anytime</span>
              </div>

              <ul className="mt-6 space-y-3">
                {t.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-neutral-300">
                    <Check className="mt-0.5 h-5 w-5 flex-none text-purple-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleClick(t)}
                className={cls(
                  'mt-8 w-full rounded-xl px-4 py-3 text-center font-medium transition',
                  t.id === 'free'
                    ? 'bg-neutral-800 hover:bg-neutral-700'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_10px_30px_-10px_rgba(168,85,247,0.6)]'
                )}
              >
                {t.cta}
              </button>

              {t.id === 'pro' && (
                <p className="mt-3 text-center text-xs text-purple-200/80">
                  Includes AI features & watermark-free exports
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Guarantee / Security footnote */}
        <div className="mt-10 flex flex-col items-center gap-2 text-sm text-neutral-400 md:flex-row md:justify-center">
          <Shield className="h-4 w-4" />
          <span>Secure checkout via Stripe • No hidden fees • Cancel anytime</span>
        </div>
      </div>
    </section>
  );
}
