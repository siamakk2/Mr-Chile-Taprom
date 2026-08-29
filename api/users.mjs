/**
 * /api/users/ — who can edit the site.
 *
 *   GET                      list editors on this site
 *   POST {email,name,role}   invite someone
 *   PATCH {id,status|role}   suspend, reactivate, or change role
 *   DELETE ?id=              remove entirely
 *
 * Only an owner may change anything. Everything is written to auth_events, so
 * "who gave this person access" always has an answer.
 */
import { json, readRaw, db, ORIGIN, fail } from './_lib.mjs';
import {
  currentEditor, sitesFor, isOwner, newToken, hashToken, audit,
} from './_auth.mjs';

const INVITE_DAYS = 7;

export default async function handler(req, res) {
  try {
    const me = await currentEditor(req);
    if (!me) return json(res, 401, { error: 'Sign in first.' });

    const mySites = await sitesFor(me.id);
    if (!mySites.length) return json(res, 403, { error: 'No site assigned.' });
    const site = mySites[0];                 // one site per editor for now
    const owner = isOwner(mySites);

    if (req.method === 'GET') return list(res, site, me, owner);

    if (!owner) return json(res, 403, { error: 'Only an owner can manage people.' });

    if (req.method === 'POST')   return invite(req, res, site, me);
    if (req.method === 'PATCH')  return update(req, res, site, me);
    if (req.method === 'DELETE') return remove(req, res, site, me);
    return json(res, 405, { error: 'method not allowed' });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}

async function list(res, site, me, owner) {
  const rows = await db(
    `site_editors?site_id=eq.${site.id}&select=role,editors(id,email,name,status,last_login_at,created_at)`,
  );
  const people = (rows ?? []).map((r) => ({ ...r.editors, role: r.role }))
    .sort((a, b) => (a.email > b.email ? 1 : -1));
  return json(res, 200, {
    site: { name: site.name, slug: site.slug },
    me: { id: me.id, email: me.email, name: me.name, isOwner: owner },
    people,
  });
}

async function invite(req, res, site, me) {
  const body = JSON.parse((await readRaw(req)).toString() || '{}');
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim() || null;
  const role = ['owner', 'editor', 'viewer'].includes(body.role) ? body.role : 'editor';

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json(res, 400, { error: 'That does not look like an email address.' });
  }

  // Reuse the account if it exists; someone invited twice should not get a
  // second row and a broken unique constraint.
  let editor = (await db(`editors?email=eq.${encodeURIComponent(email)}&select=*`))?.[0];
  if (!editor) {
    [editor] = await db('editors', {
      method: 'POST', prefer: 'return=representation',
      body: { email, name, status: 'invited' },
    });
  }

  await db('site_editors', {
    method: 'POST',
    prefer: 'resolution=merge-duplicates',
    body: { site_id: site.id, editor_id: editor.id, role },
  });

  const token = newToken();
  await db('invites', {
    method: 'POST',
    body: {
      editor_id: editor.id,
      token_hash: hashToken(token),
      expires_at: new Date(Date.now() + INVITE_DAYS * 864e5).toISOString(),
    },
  });

  await audit('invite_created', { editorId: me.id, email, detail: `role=${role}`, req });

  const link = `${ORIGIN()}/api/accept/?t=${token}`;
  const sent = await sendInvite({ to: email, name, link, site: site.name, from: me.name || me.email });

  // The link is returned either way. If email is not configured, or delivery
  // fails, the invitation still exists and can be sent by hand rather than
  // silently going nowhere.
  return json(res, 200, { ok: true, emailed: sent, link, expiresInDays: INVITE_DAYS });
}

async function update(req, res, site, me) {
  const body = JSON.parse((await readRaw(req)).toString() || '{}');
  const id = String(body.id || '');
  if (!id) return json(res, 400, { error: 'Missing id.' });
  if (id === me.id && (body.status === 'suspended' || body.role === 'viewer')) {
    return json(res, 400, { error: 'You cannot lock yourself out.' });
  }

  if (body.status) {
    if (!['active', 'suspended'].includes(body.status)) return json(res, 400, { error: 'Bad status.' });
    await db(`editors?id=eq.${id}`, { method: 'PATCH', body: { status: body.status } });
    // Suspension must end existing sessions, not just prevent new ones.
    if (body.status === 'suspended') await db(`sessions?editor_id=eq.${id}`, { method: 'DELETE' });
    await audit('status_changed', { editorId: me.id, detail: `${id} -> ${body.status}`, req });
  }

  if (body.role) {
    if (!['owner', 'editor', 'viewer'].includes(body.role)) return json(res, 400, { error: 'Bad role.' });
    await db(`site_editors?site_id=eq.${site.id}&editor_id=eq.${id}`, {
      method: 'PATCH', body: { role: body.role },
    });
    await audit('role_changed', { editorId: me.id, detail: `${id} -> ${body.role}`, req });
  }

  return json(res, 200, { ok: true });
}

async function remove(req, res, site, me) {
  const id = new URL(req.url, 'https://x').searchParams.get('id');
  if (!id) return json(res, 400, { error: 'Missing id.' });
  if (id === me.id) return json(res, 400, { error: 'You cannot remove yourself.' });

  await db(`site_editors?site_id=eq.${site.id}&editor_id=eq.${id}`, { method: 'DELETE' });
  await db(`sessions?editor_id=eq.${id}`, { method: 'DELETE' });

  // If they are on no other site, the account is dead weight; remove it so an
  // orphaned row cannot be reactivated later by mistake.
  const left = await db(`site_editors?editor_id=eq.${id}&select=site_id`);
  if (!left?.length) await db(`editors?id=eq.${id}`, { method: 'DELETE' });

  await audit('access_removed', { editorId: me.id, detail: id, req });
  return json(res, 200, { ok: true });
}

async function sendInvite({ to, name, link, site, from }) {
  if (!process.env.RESEND_API_KEY) return false;
  const html = `<!doctype html><body style="font:400 16px/1.6 system-ui;color:#2a211c;padding:24px">
<p>${escapeHtml(name || 'Hello')},</p>
<p>${escapeHtml(from)} has given you access to edit the <strong>${escapeHtml(site)}</strong> website.</p>
<p><a href="${link}" style="display:inline-block;background:#C1272D;color:#fff;padding:12px 20px;
border-radius:8px;text-decoration:none">Set your password</a></p>
<p style="color:#6b6157;font-size:14px">This link works once and expires in ${INVITE_DAYS} days.
If you were not expecting it, ignore this email.</p></body>`;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: process.env.INVITE_FROM || 'Mr. Chile Taproom <no-reply@mrchiletaproom.com>',
        to: [to], subject: `Edit the ${site} website`, html,
      }),
    });
    return r.ok;
  } catch { return false; }
}

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
