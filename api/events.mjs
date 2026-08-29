/**
 * GET /api/events — the nights the door might be scanning for.
 *
 * Deliberately thin: id, name, date only. No sales figures, no capacity, no
 * counts. This is fetched by a page loaded on staff phones and reachable by
 * anyone who finds the URL, so it must not become a window onto the business.
 */
import { json, db, TICKETING_ON } from './_lib.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'method not allowed' });
  if (!TICKETING_ON()) return json(res, 200, { events: [] });

  try {
    const from = new Date(Date.now() - 36e5 * 12).toISOString().slice(0, 10);
    const rows = await db(
      `events?occurs_on=gte.${from}&status=in.(on_sale,sold_out,closed)` +
      '&select=id,name,occurs_on&order=occurs_on.asc&limit=12',
    );
    return json(res, 200, { events: rows ?? [] });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
