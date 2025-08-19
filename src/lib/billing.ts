// Lightweight client helpers for Stripe checkout and entitlement checks (JWT-based)
import { supabase } from '@/lib/supabase';

export async function createCheckout(priceId: string) {
  if (!priceId) throw new Error('priceId is required');
  
  // In demo mode, simulate checkout
  if (import.meta.env.VITE_DEMO === 'true') {
    throw new Error('Checkout is not available in demo mode. This would normally redirect to Stripe.');
  }
  
  if (!supabase) throw new Error('Authentication not available');
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const res = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ priceId }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => 'Failed to create checkout session');
    throw new Error(msg || 'Failed to create checkout session');
  }
  const { url } = await res.json();
  if (!url) throw new Error('Missing checkout URL');
  // Navigate to Stripe Checkout
  window.location.assign(url);
}

export async function hasPro(): Promise<boolean> {
  // In demo mode, return true to enable all features
  if (import.meta.env.VITE_DEMO === 'true') {
    return true;
  }
  
  if (!supabase) return false;
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const res = await fetch('/api/pro/me', {
    method: 'GET',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (!res.ok) return false;
  const body = (await res.json().catch(() => ({ pro: false }))) as { pro?: boolean };
  return Boolean(body?.pro);
}
