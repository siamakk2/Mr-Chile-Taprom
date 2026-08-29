/**
 * POST /api/webhook — Stripe events.
 *
 * This is the only place tickets are minted. Not the success page: a browser
 * that never loads the redirect, or loads it twice, must not decide whether
 * somebody gets in.
 *
 * Three properties this has to hold:
 *   1. Unsigned or stale requests are rejected outright.
 *   2. Replays are harmless. Stripe retries for days; the unique constraint on
 *      orders.stripe_session_id turns a duplicate into a no-op.
 *   3. A refund or dispute voids the tickets, so a refunded QR stops working
 *      at the door.
 */
import {
  json, readRaw, verifyStripeSignature, db, newSerial, humanSerial, requireEnv,
} from './_lib.mjs';
import { sendTicketEmail } from './_email.mjs';

export const config = { api: { bodyParser: false } }; // signature needs the raw bytes

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' });

  let event;
  try {
    requireEnv('STRIPE_WEBHOOK_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'TICKET_SIGNING_KEY');
    const raw = (await readRaw(req)).toString('utf8');
    const ok = verifyStripeSignature(raw, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    if (!ok) return json(res, 400, { error: 'bad signature' });
    event = JSON.parse(raw);
  } catch (e) {
    return json(res, e.statusCode || 400, { error: e.message });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await issue(event.data.object);
        break;
      case 'charge.refunded':
        await voidByPaymentIntent(event.data.object.payment_intent, 'refunded');
        break;
      case 'charge.dispute.created':
        await voidByPaymentIntent(event.data.object.payment_intent, 'disputed');
        break;
      default:
        break; // everything else is acknowledged and ignored
    }
    // Always 200 on a handled event. A non-2xx makes Stripe retry, and retrying
    // will not fix a malformed event — it only floods the endpoint.
    return json(res, 200, { received: true });
  } catch (e) {
    // A genuine downstream failure (database unreachable) should retry.
    return json(res, 500, { error: e.message });
  }
}

async function issue(session) {
  if (session.payment_status !== 'paid') return;

  const eventId = session.metadata?.event_id || session.client_reference_id;
  const qty = Number.parseInt(session.metadata?.quantity ?? '1', 10);
  const email = session.customer_details?.email;
  const name = session.custom_fields?.find((f) => f.key === 'attendee_name')?.text?.value
    || session.customer_details?.name
    || null;

  if (!eventId || !email || !Number.isInteger(qty) || qty < 1) return;

  // Idempotency: the unique index on stripe_session_id means a replay lands
  // here and returns nothing new to insert.
  const existing = await db(`orders?stripe_session_id=eq.${encodeURIComponent(session.id)}&select=id`);
  if (existing?.length) return;

  let order;
  try {
    [order] = await db('orders', {
      method: 'POST',
      prefer: 'return=representation',
      body: {
        event_id: eventId,
        stripe_session_id: session.id,
        payment_intent_id: session.payment_intent ?? null,
        email,
        name,
        quantity: qty,
        amount_cents: session.amount_total,
        currency: session.currency ?? 'usd',
        status: 'paid',
      },
    });
  } catch (e) {
    // 23505 = unique violation: two webhook deliveries raced. The other one won.
    if (String(e.message).includes('duplicate key')) return;
    throw e;
  }

  const secret = process.env.TICKET_SIGNING_KEY;
  const rows = Array.from({ length: qty }, (_, i) => ({
    order_id: order.id,
    event_id: eventId,
    serial_no: newSerial(secret),
    seq: i + 1,
  }));
  const tickets = await db('tickets', { method: 'POST', prefer: 'return=representation', body: rows });

  const [ev] = await db(`events?id=eq.${encodeURIComponent(eventId)}&select=*`);
  await sendTicketEmail({
    to: email,
    name,
    event: ev,
    tickets: tickets.map((t) => ({ serial: t.serial_no, human: humanSerial(t.serial_no) })),
  });
}

async function voidByPaymentIntent(pi, status) {
  if (!pi) return;
  const [order] = await db(`orders?payment_intent_id=eq.${encodeURIComponent(pi)}&select=id`);
  if (!order) return;
  await db(`orders?id=eq.${order.id}`, {
    method: 'PATCH',
    body: { status, refunded_at: new Date().toISOString() },
  });
  // Only unredeemed tickets are voided. Somebody who already danced was
  // admitted in good faith; that is a chargeback to argue, not a record to
  // rewrite after the fact.
  await db(`tickets?order_id=eq.${order.id}&status=eq.valid`, {
    method: 'PATCH',
    body: { status: 'void' },
  });
}
