/**
 * POST /api/bootstrap/ — create the very first owner.
 *
 * A chicken-and-egg problem: only an owner can invite people, and at the start
 * there are none. This creates one, and only ever one.
 *
 * It refuses the moment any editor exists, so it cannot be used again, and it
 * requires BOOTSTRAP_SECRET to match, so it is not open to whoever finds the
 * URL in the minutes before the first account is made. Delete that variable
 * once you have signed in.
 */
import { json, readRaw, db, ORIGIN } from './_lib.mjs';
import { hashPassword, audit } from './_auth.mjs';
import { timingSafeEqual } from 'node:crypto';

const eq = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' });

  try {
    if (!process.env.BOOTSTRAP_SECRET) {
      return json(res, 403, { error: 'Bootstrap is closed. Set BOOTSTRAP_SECRET to open it.' });
    }

    const existing = await db('editors?select=id&limit=1');
    if (existing?.length) {
      return json(res, 409, { error: 'An account already exists. Invite people from /team/ instead.' });
    }

    const body = JSON.parse((await readRaw(req)).toString() || '{}');
    if (!eq(body.secret ?? '', process.env.BOOTSTRAP_SECRET)) {
      await audit('bootstrap_denied', { email: body.email ?? null, req });
      return json(res, 401, { error: 'Wrong bootstrap secret.' });
    }

    const email = String(body.email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json(res, 400, { error: 'A valid email is required.' });
    }

    const [editor] = await db('editors', {
      method: 'POST', prefer: 'return=representation',
      body: {
        email,
        name: String(body.name || '').trim() || null,
        password_hash: await hashPassword(String(body.password || '')),
        status: 'active',
      },
    });

    const sites = await db('sites?select=id,slug');
    for (const s of sites ?? []) {
      await db('site_editors', {
        method: 'POST', prefer: 'resolution=merge-duplicates',
        body: { site_id: s.id, editor_id: editor.id, role: 'owner' },
      });
    }

    await audit('bootstrap', { editorId: editor.id, email, detail: `owner of ${sites?.length ?? 0} site(s)`, req });
    return json(res, 200, {
      ok: true,
      email,
      sites: (sites ?? []).map((s) => s.slug),
      next: `${ORIGIN()}/admin/`,
      reminder: 'Delete BOOTSTRAP_SECRET from the environment now.',
    });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}
