/**
 * POST /api/checkout  { eventId, quantity }
 *
 * Creates a Stripe Checkout Session and returns its URL. Card details never
 * touch this site — Stripe hosts the payment page, which keeps PCI scope at
 * SAQ-A and keeps a taproom out of the business of handling card numbers.
 *
 * Price is read from the database, never from the request. A client that posts
 * its own price is the oldest bug in e-commerce.
 */
import { json, readRaw, stripe, db, TICKETING_ON, requireEnv } from './_lib.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' });
  if (!TICKETING_ON()) return json(res, 503, { error: 'ticket sales are not open yet' });

  try {
    requireEnv('STRIPE_SECRET_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'SITE_ORIGIN');

    const { eventId, quantity } = JSON.parse((await readRaw(req)).toString() || '{}');
    const qty = Number.parseInt(quantity, 10);
    if (!eventId || !Number.isInteger(qty) || qty < 1 || qty > 10) {
      return json(res, 400, { error: 'eventId and a quantity of 1–10 are required' });
    }

    const [event] = await db(`events?id=eq.${encodeURIComponent(eventId)}&select=*`);
    if (!event) return json(res, 404, { error: 'event not found' });
    if (event.status !== 'on_sale') return json(res, 409, { error: 'this event is not on sale' });
    if (event.sales_close_at && new Date(event.sales_close_at) < new Date()) {
      return json(res, 409, { error: 'advance sales have closed — tickets are available at the door' });
    }

    // Capacity is checked here and again in the webhook. This check is a
    // courtesy so people are not sent to a payment page for a sold-out night;
    // the webhook check is the one that actually protects the door.
    if (event.capacity != null) {
      const sold = await db(
        `tickets?event_id=eq.${event.id}&status=in.(valid,redeemed)&select=id`,
        { prefer: 'count=exact' },
      );
      if ((sold?.length ?? 0) + qty > event.capacity) {
        return json(res, 409, { error: 'not enough tickets left' });
      }
    }

    const origin = process.env.SITE_ORIGIN;
    const session = await stripe('checkout/sessions', {
      mode: 'payment',
      success_url: `${origin}/tickets/confirmed/?s={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cumbia-rosa/`,
      client_reference_id: event.id,
      // Collected so the ticket email has somewhere to go and the door has a
      // name to check against ID.
      customer_creation: 'if_required',
      phone_number_collection: { enabled: false },
      custom_fields: [{
        key: 'attendee_name',
        label: { type: 'custom', custom: 'Name on the door list' },
        type: 'text',
      }],
      line_items: [{
        quantity: qty,
        price_data: {
          currency: 'usd',
          unit_amount: event.advance_cents,
          product_data: {
            name: `${event.name} — ${event.occurs_on}`,
            description: 'Advance admission. 21 and over, bring ID.',
          },
        },
      }],
      metadata: { event_id: event.id, quantity: String(qty) },
      payment_intent_data: { metadata: { event_id: event.id } },
    });

    return json(res, 200, { url: session.url });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message || 'checkout failed' });
  }
}
