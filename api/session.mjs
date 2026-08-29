/**
 * GET /api/session/ — who is signed in, if anyone.
 *
 * Used by the on-site editor to decide whether to show itself. Returns only
 * what the overlay needs: a name, a role, and nothing else.
 */
import { json } from './_lib.mjs';
import { currentEditor, sitesFor } from './_auth.mjs';

export default async function handler(req, res) {
  try {
    const me = await currentEditor(req);
    if (!me) return json(res, 200, { signedIn: false });
    const sites = await sitesFor(me.id);
    const site = sites[0] || null;
    return json(res, 200, {
      signedIn: true,
      name: me.name || me.email,
      role: site?.role ?? null,
      canEdit: Boolean(site) && site.role !== 'viewer',
    });
  } catch {
    return json(res, 200, { signedIn: false });
  }
}
