// Lightweight client helpers for Stripe checkout and entitlement checks
export async function createCheckout(userId?: string) {
  const res = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
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

export async function hasPro(userId?: string): Promise<boolean> {
  const res = await fetch('/api/pro/me', {
    method: 'GET',
    headers: userId ? { 'x-user-id': userId } as Record<string, string> : {},
  });
  if (!res.ok) return false;
  const data = await res.json().catch(() => ({ pro: false }));
  return Boolean(data?.pro);
}
