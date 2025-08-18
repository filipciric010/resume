export async function startCheckout(priceId: string, userId?: string) {
  const r = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, userId }),
  });
  if (!r.ok) throw new Error('Checkout failed');
  const { url } = await r.json();
  if (!url) throw new Error('No checkout URL returned');
  window.location.assign(url);
}

import { supabase } from '@/lib/supabase';

export async function hasPro(): Promise<boolean> {
  const sessionRes = await supabase.auth.getSession();
  const accessToken = sessionRes?.data?.session?.access_token;
  const r = await fetch('/api/pro/me', {
    method: 'GET',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (!r.ok) return false;
  const json = (await r.json().catch(() => ({ pro: false }))) as { pro?: boolean };
  return Boolean(json?.pro);
}
