/**
 * POST /api/github-webhook/
 *
 * GitHub Apps require a webhook URL when webhooks are switched on, and nothing
 * in this system needs to react to repository events. This endpoint exists so
 * that form can be filled in without pointing it somewhere unrelated.
 *
 * It deliberately does nothing except acknowledge. If a secret is configured it
 * is verified first, so this cannot be used as an open endpoint to spray
 * traffic at; without one, the body is read and discarded.
 *
 * The one event worth handling later is `installation.deleted` — if the app is
 * uninstalled, editor logins stop working and it would be better to know that
 * from a log line than from a confused phone call.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { json, readRaw } from './_lib.mjs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' });

  const raw = await readRaw(req);

  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (secret) {
    const sent = String(req.headers['x-hub-signature-256'] || '');
    const expected = 'sha256=' + createHmac('sha256', secret).update(raw).digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(sent);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return json(res, 401, { error: 'bad signature' });
    }
  }

  const event = String(req.headers['x-github-event'] || 'unknown');
  if (event === 'installation' || event === 'installation_repositories') {
    try {
      const body = JSON.parse(raw.toString('utf8') || '{}');
      console.log(`[github-app] ${event}.${body.action} for ${body.installation?.account?.login}`);
    } catch { /* acknowledge regardless; a parse failure is not GitHub's problem */ }
  }

  return json(res, 200, { received: true });
}
