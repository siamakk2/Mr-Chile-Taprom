/**
 * POST /api/logout/ — end the session on the server, not just in the browser.
 *
 * The row is deleted rather than the cookie merely cleared, so a copied cookie
 * is worthless afterwards.
 */
import { json } from './_lib.mjs';
import { destroySession, clearCookie, currentEditor, audit } from './_auth.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' });
  try {
    const me = await currentEditor(req).catch(() => null);
    await destroySession(req);
    if (me) await audit('logout', { editorId: me.id, email: me.email, req });
  } catch { /* logging out must always succeed from the user's point of view */ }
  res.setHeader('set-cookie', clearCookie());
  return json(res, 200, { ok: true });
}
