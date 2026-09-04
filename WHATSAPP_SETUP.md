# WhatsApp Order Confirmation

This storefront does not talk to Meta directly. A separate project,
[whatsapp-agent](https://github.com/UdayExpound/whatsapp-agent), owns the
Meta WhatsApp Business API credentials, the approved message template, and
the AI agent that handles customer replies. This repo only calls that
project's notify endpoint once an order is saved.

## Environment Variables

Add these to `.env` (and to this project's Vercel env vars for production):

```
WHATSAPP_AGENT_URL=https://whatsapp-agent-vert-two.vercel.app
NOTIFY_API_SECRET=<same value as whatsapp-agent's NOTIFY_API_SECRET>
```

`NOTIFY_API_SECRET` must match exactly what's set in the whatsapp-agent
project - it's the shared secret that authenticates this server-to-server
call (see `api/utils/whatsappNotify.js`).

## How It Works

1. **Payment verified**: `api/verify-payment.js` confirms the Razorpay signature.
2. **Order saved**: `api/save-order.js` persists the order to Firestore.
3. **WhatsApp triggered**: if `paymentStatus === "paid"` (i.e. a real payment,
   not a collaboration/bypass order), `save-order.js` calls
   `sendOrderConfirmationWhatsApp()`, which POSTs to whatsapp-agent's
   `POST /api/notify/order-confirmed` with the customer's phone, name, order
   number, and amount, authenticated via the `x-notify-secret` header.
4. **Template sent**: whatsapp-agent sends the approved `order_confirmation`
   Message Template via the Meta Graph API (business-initiated messages
   require a pre-approved template, since there's no open customer session
   yet) and logs it into the same `conversations`/`messages` tables the AI
   agent uses.
5. **AI takes over**: when the customer replies, whatsapp-agent's webhook
   finds the conversation (already created in step 4, in the default `agent`
   mode) and the AI responds automatically - no extra wiring needed.

## Message Template

Submit this once in Meta Business Manager (WhatsApp Manager > Message
Templates). Utility-category templates like this are usually approved
automatically within minutes.

- **Name**: `order_confirmation`
- **Category**: Utility
- **Language**: English
- **Body**:
  ```
  Hi {{1}}, your Furever Steffie order {{2}} is confirmed! Amount paid: ₹{{3}}. We'll message you here with updates as your pup's outfit is prepared. Thank you for shopping with us! 🐾
  ```
- **Sample values**: `{{1}}` Uday, `{{2}}` ORD-478542, `{{3}}` 2499
- No header, footer, or buttons - keeping it to plain body text with no
  promotional language maximizes the chance of automatic approval.

The variable order must match `sendOrderConfirmationWhatsApp()`'s payload:
customer name, order number, amount - in that order.

If the template name ever changes, update
`WHATSAPP_ORDER_CONFIRMATION_TEMPLATE` in whatsapp-agent's env vars (defaults
to `order_confirmation`).

## Error Handling

- WhatsApp failures never fail the order - they're caught and logged.
- Collaboration/bypass orders (no real Razorpay payment) do not trigger a
  WhatsApp confirmation.

## Testing

1. Place a test order (real payment, not the collaboration coupon).
2. Check the storefront's server logs for `✅ WhatsApp order confirmation sent`.
3. Check whatsapp-agent's dashboard - the conversation should show the
   confirmation logged, and a reply from that number should get an AI response.
