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

export async function hasPro(userId?: string): Promise<boolean> {
  const r = await fetch('/api/pro/me', {
    method: 'GET',
    headers: userId ? { 'x-user-id': userId } as Record<string, string> : {},
  });
  if (!r.ok) return false;
  const data = await r.json().catch(() => ({ pro: false }));
  return Boolean(data?.pro);
}
