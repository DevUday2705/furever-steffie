const NOTIFY_TIMEOUT_MS = 8000;

// Triggers the business-initiated WhatsApp order confirmation by calling the
// separate whatsapp-agent project's notify endpoint. That project owns the
// Meta WhatsApp cre dentials and the approved message template - this repo
// only needs the shared secret to authenticate the call. Business-initiated
// messages require an approved template (not a free-form message) since the
// customer has no open 24-hour session at order time.
export async function sendOrderConfirmationWhatsApp({ phone, customerName, orderNumber, amount }) {
  const baseUrl = process.env.WHATSAPP_AGENT_URL;
  const secret = process.env.NOTIFY_API_SECRET;

  if (!baseUrl || !secret) {
    console.warn('⚠️ WHATSAPP_AGENT_URL or NOTIFY_API_SECRET not configured; skipping WhatsApp order confirmation');
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NOTIFY_TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/notify/order-confirmed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-notify-secret': secret,
      },
      body: JSON.stringify({ phone, customerName, orderNumber, amount }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      console.error(`❌ WhatsApp order confirmation failed (${res.status}):`, errorBody);
      return;
    }

    console.log('✅ WhatsApp order confirmation sent');
  } catch (error) {
    console.error('❌ WhatsApp order confirmation request failed:', error.message);
  } finally {
    clearTimeout(timeout);
  }
}
