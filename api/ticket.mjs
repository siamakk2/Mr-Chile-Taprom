/**
 * GET /api/ticket?serial=... — the page a guest holds up at the door.
 *
 * Rendered server-side and never cached. The QR is drawn in the browser from
 * a vendored encoder, so no image is stored anywhere and the page can show
 * live status: a ticket already scanned says so in red rather than looking
 * identical to a valid one.
 */
import { json, db, serialIsWellFormed, humanSerial, requireEnv, TICKETING_ON } from './_lib.mjs';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async function handler(req, res) {
  if (!TICKETING_ON()) return json(res, 503, { error: 'ticketing is off' });
  try {
    requireEnv('TICKET_SIGNING_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY');
    const url = new URL(req.url, 'https://x');
    const serial = url.searchParams.get('serial') || '';

    if (!serialIsWellFormed(serial, process.env.TICKET_SIGNING_KEY)) return page(res, 404, notFound());

    const [t] = await db(`tickets?serial_no=eq.${encodeURIComponent(serial)}&select=*,orders(name,email),events(*)`);
    if (!t) return page(res, 404, notFound());

    const ev = t.events || {};
    const state = t.status === 'redeemed' ? 'redeemed' : t.status === 'void' ? 'void' : 'valid';
    const label = { valid: 'Valid', redeemed: 'Already scanned', void: 'Not valid' }[state];

    return page(res, 200, `
<div class="card" data-state="${state}">
  <p class="ev">${esc(ev.name || 'Cumbia Rosa')}</p>
  <p class="dt">${esc(ev.occurs_on || '')} · doors ${esc((ev.doors_at || '20:00').slice(0, 5))}</p>
  <div class="qr"><canvas id="qr" width="240" height="240"></canvas></div>
  <p class="serial">${esc(humanSerial(serial))}</p>
  <p class="status">${esc(label)}${t.redeemed_at ? ` · ${esc(new Date(t.redeemed_at).toLocaleString('en-US'))}` : ''}</p>
  ${t.orders?.name ? `<p class="who">${esc(t.orders.name)} · ticket ${t.seq}</p>` : ''}
  <p class="note">21 and over. Bring ID. Each ticket is scanned once.</p>
</div>
<script>window.__SERIAL__=${JSON.stringify(serial)};</script>
<script src="/qr.js"></script>
<script>QR.render(document.getElementById('qr'), window.__SERIAL__);</script>`);
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}

const notFound = () => `<div class="card" data-state="void">
  <p class="ev">Ticket not found</p>
  <p class="note">Check the link in your email, or give your name at will-call.</p>
</div>`;

function page(res, status, inner) {
  res.statusCode = status;
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.setHeader('x-robots-tag', 'noindex');
  res.end(`<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Your ticket — Mr. Chile Taproom</title>
<style>
:root{--ink:#16100E;--masa:#F2E9D8;--chile:#C1272D;--marigold:#F0A830;--verde:#57B583}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;
background:var(--ink);color:var(--masa);font:400 16px/1.6 system-ui,-apple-system,sans-serif;padding:1.5rem}
.card{width:100%;max-width:22rem;text-align:center;background:#211815;border:1px solid rgba(242,233,216,.16);
border-radius:14px;padding:1.75rem}
.ev{font:700 1.35rem/1.2 system-ui;margin:0 0 .3rem}
.dt{margin:0 0 1.25rem;color:#B7A992;font-size:.95rem}
.qr{background:#fff;border-radius:10px;padding:12px;display:inline-block;line-height:0}
.card[data-state=redeemed] .qr,.card[data-state=void] .qr{opacity:.25}
.serial{font:600 1.05rem/1 ui-monospace,monospace;letter-spacing:.06em;margin:1.1rem 0 .5rem}
.status{margin:0;font-weight:600}
.card[data-state=valid] .status{color:var(--verde)}
.card[data-state=redeemed] .status{color:var(--marigold)}
.card[data-state=void] .status{color:var(--chile)}
.who{margin:.4rem 0 0;color:#B7A992;font-size:.9rem}
.note{margin:1.25rem 0 0;color:#B7A992;font-size:.82rem}
</style></head><body>${inner}</body></html>`);
}
