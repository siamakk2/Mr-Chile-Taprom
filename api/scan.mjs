/**
 * POST /api/scan  { serial, eventId }   — door staff only.
 *
 * Redemption is a single database call to redeem_ticket(), which does the
 * check and the update atomically. Doing it as SELECT-then-UPDATE here would
 * admit two people on one code whenever two phones scan at the same instant,
 * and on a busy door that is not a rare event.
 *
 * Auth is a shared door code, not accounts. Staff turnover at a venue is
 * quick, the code is rotated per night, and nobody is creating a login on the
 * pavement. It rides in a header, and every scan records who used it.
 */
import { json, readRaw, rpc, serialIsWellFormed, sign, db, requireEnv, TICKETING_ON } from './_lib.mjs';
import { timingSafeEqual } from 'node:crypto';

const eq = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' });
  if (!TICKETING_ON()) return json(res, 503, { error: 'ticketing is off' });

  try {
    requireEnv('DOOR_CODE', 'TICKET_SIGNING_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY');

    const supplied = req.headers['x-door-code'];
    if (!supplied || !eq(supplied, process.env.DOOR_CODE)) {
      return json(res, 401, { error: 'bad door code' });
    }

    const payload = JSON.parse((await readRaw(req)).toString() || '{}');
    const { eventId, by } = payload;
    if (!eventId) return json(res, 400, { error: 'eventId required' });

    // Two ways in: a scanned QR carries the full signed serial; will-call types
    // only the readable body, from which the signature is reconstructed. Both
    // end up at the same signed value, so neither path is a weaker door.
    let serial = payload.serial;
    if (!serial && typeof payload.body === 'string') {
      const body = payload.body.trim().toUpperCase().replace(/^MCT-/, '').replace(/-/g, '');
      if (body.length === 10) serial = `${body}.${sign(body, process.env.TICKET_SIGNING_KEY)}`;
    }
    if (!serial) return json(res, 400, { error: 'serial or body required' });

    // Reject a forged code before spending a database round trip on it, and
    // log the attempt — a run of these at the door is worth knowing about.
    if (!serialIsWellFormed(serial, process.env.TICKET_SIGNING_KEY)) {
      await db('scans', {
        method: 'POST',
        body: { serial_no: String(serial).slice(0, 64), result: 'bad_signature', scanned_by: by ?? 'door' },
      }).catch(() => {});
      return json(res, 200, { result: 'bad_signature', admit: false });
    }

    const rows = await rpc('redeem_ticket', {
      p_serial: serial,
      p_event: eventId,
      p_by: (by ?? 'door').slice(0, 60),
    });
    const out = Array.isArray(rows) ? rows[0] : rows;

    return json(res, 200, {
      result: out?.result ?? 'unknown',
      admit: out?.result === 'admitted',
      holder: out?.holder ?? null,
      seq: out?.seq ?? null,
    });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
