/**
 * Ticket delivery.
 *
 * The email carries a link, not an embedded QR image. Two reasons: inlined
 * images are stripped or blocked by a good share of mail clients, which is
 * exactly the failure you discover in a queue at 9pm; and the ticket page can
 * show live status ("already scanned") where a static image cannot.
 *
 * The human-readable serial is in the email body as well, so will-call can
 * find the order when the phone is dead.
 */
import { db, ORIGIN } from './_lib.mjs';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function sendTicketEmail({ to, name, event, tickets }) {
  const origin = ORIGIN();
  const subject = `Your tickets — ${event?.name ?? 'Cumbia Rosa'}, ${event?.occurs_on ?? ''}`.trim();

  const rows = tickets.map((t) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e6ddcc">
        <div style="font:600 15px system-ui">${esc(t.human)}</div>
        <a href="${origin}/tickets/${encodeURIComponent(t.serial)}/"
           style="font:500 14px system-ui;color:#C1272D">Open this ticket &rarr;</a>
      </td>
    </tr>`).join('');

  const html = `<!doctype html><html><body style="margin:0;background:#F2E9D8">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0"
 style="max-width:560px;background:#fff;margin:24px;border-radius:8px">
<tr><td style="padding:28px">
<h1 style="font:700 22px system-ui;margin:0 0 4px">${esc(event?.name ?? 'Cumbia Rosa')}</h1>
<p style="font:400 15px system-ui;color:#5b5148;margin:0 0 20px">
${esc(event?.occurs_on ?? '')} · Doors ${esc(event?.doors_at ?? '8:00pm')} · 21+, bring ID<br>
Mr. Chile Taproom, 4357 Montgomery Dr, Suite B, Santa Rosa, CA
</p>
${name ? `<p style="font:400 15px system-ui;margin:0 0 16px">Door list name: <strong>${esc(name)}</strong></p>` : ''}
<table role="presentation" width="100%">${rows}</table>
<p style="font:400 13px system-ui;color:#6b6157;margin:22px 0 0">
Show the ticket page at the door — each one is scanned once. Lost the email?
Give your name and the code above at will-call.
</p>
</td></tr></table></td></tr></table></body></html>`;

  const text = [
    `${event?.name ?? 'Cumbia Rosa'} — ${event?.occurs_on ?? ''}`,
    'Mr. Chile Taproom, 4357 Montgomery Dr, Suite B, Santa Rosa, CA',
    '21 and over, bring ID.',
    '',
    ...tickets.map((t) => `${t.human}  ${origin}/tickets/${t.serial}/`),
    '',
    'Each ticket is scanned once. Lost this email? Give your name and code at will-call.',
  ].join('\n');

  // Resend is the transport, chosen because it needs one API key and no SDK.
  // If it is not configured the send is recorded rather than thrown: a
  // delivery failure must never lose a paid ticket, and the ticket already
  // exists in the database and at will-call by this point.
  if (!process.env.RESEND_API_KEY) {
    await note(to, subject, 'email_not_configured');
    return;
  }

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.TICKET_FROM || 'Mr. Chile Taproom <tickets@mrchiletaproom.com>',
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!r.ok) await note(to, subject, `send_failed_${r.status}`);
}

async function note(to, subject, result) {
  try {
    await db('scans', { method: 'POST', body: { serial_no: `email:${to}`, result: 'unknown', scanned_by: `${result} ${subject}`.slice(0, 200) } });
  } catch { /* logging must never throw into the webhook */ }
}
