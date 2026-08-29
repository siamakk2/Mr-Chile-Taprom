/**
 * Editor accounts: hashing, sessions, audit.
 *
 * Deliberately small and dependency-free. node:crypto has scrypt and a
 * constant-time comparison, which is everything a password needs; pulling in a
 * hashing library would add a supply chain for no capability.
 */
import { randomBytes, scrypt as _scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { db, fail } from './_lib.mjs';

const scrypt = promisify(_scrypt);

// Deliberately slow. These are the OWASP-suggested scrypt parameters; the cost
// is paid once per login and is what makes a stolen hash table worthless.
const N = 16384, r = 8, p = 1, KEYLEN = 64;

export const SESSION_COOKIE = 'mct_session';
const SESSION_DAYS = 14;

// --- passwords ---------------------------------------------------------------
export async function hashPassword(plain) {
  if (typeof plain !== 'string' || plain.length < 10) {
    throw fail('Password must be at least 10 characters', 400);
  }
  const salt = randomBytes(16);
  const key = await scrypt(plain, salt, KEYLEN, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

export async function verifyPassword(plain, stored) {
  if (!stored) return false;
  const [scheme, n, rr, pp, salt, key] = stored.split('$');
  if (scheme !== 'scrypt') return false;
  const derived = await scrypt(String(plain), Buffer.from(salt, 'base64url'), KEYLEN,
    { N: Number(n), r: Number(rr), p: Number(pp) });
  const expected = Buffer.from(key, 'base64url');
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

// --- tokens ------------------------------------------------------------------
// Session and invite tokens are stored hashed. A leaked database row must not
// be replayable as a login or redeemable as an invitation.
export const newToken = () => randomBytes(32).toString('base64url');
export const hashToken = (t) => createHash('sha256').update(t).digest('hex');

// --- sessions ----------------------------------------------------------------
export async function createSession(editorId, req) {
  const token = newToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db('sessions', {
    method: 'POST',
    body: {
      editor_id: editorId,
      token_hash: hashToken(token),
      user_agent: String(req.headers['user-agent'] || '').slice(0, 300),
      ip: clientIp(req),
      expires_at: expires.toISOString(),
    },
  });
  return { token, expires };
}

/** The signed-in editor, or null. Looked up every request on purpose. */
export async function currentEditor(req) {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return null;
  const rows = await db(
    `sessions?token_hash=eq.${hashToken(token)}&select=id,expires_at,editor_id,editors(*)`,
  );
  const s = rows?.[0];
  if (!s) return null;
  if (new Date(s.expires_at) < new Date()) return null;
  // Checked here rather than only at login, so suspending someone takes effect
  // on their next request instead of in two weeks.
  if (s.editors?.status !== 'active') return null;
  return { ...s.editors, sessionId: s.id };
}

export async function destroySession(req) {
  const token = readCookie(req, SESSION_COOKIE);
  if (token) await db(`sessions?token_hash=eq.${hashToken(token)}`, { method: 'DELETE' }).catch(() => {});
}

/** Sites this editor may touch, with their role on each. */
export async function sitesFor(editorId) {
  const rows = await db(`site_editors?editor_id=eq.${editorId}&select=role,sites(*)`);
  return (rows ?? []).map((r) => ({ ...r.sites, role: r.role }));
}

export const isOwner = (sites) => sites.some((s) => s.role === 'owner');

// --- cookies -----------------------------------------------------------------
/**
 * A second, readable cookie saying "this browser belongs to an editor".
 *
 * It grants nothing — the session cookie is HttpOnly and is what the API
 * checks. This one exists so a page can decide whether to load the editing
 * script without asking the server, which keeps the cost at zero for the
 * visitors who are not staff.
 */
export const editorMarker = (expires) =>
  `mct_editor=1; Path=/; Secure; SameSite=Lax; Expires=${expires.toUTCString()}`;

export function sessionCookie(token, expires) {
  return [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Expires=${expires.toUTCString()}`,
  ].join('; ');
}

export const clearCookie = () => [
  `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
  'mct_editor=; Path=/; Secure; SameSite=Lax; Max-Age=0',
];

export function readCookie(req, name) {
  const raw = String(req.headers.cookie || '');
  const m = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(raw);
  return m ? decodeURIComponent(m[1]) : null;
}

export const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || null;

// --- audit -------------------------------------------------------------------
export async function audit(action, { editorId = null, email = null, detail = null, req = null } = {}) {
  try {
    await db('auth_events', {
      method: 'POST',
      body: { editor_id: editorId, email, action, detail, ip: req ? clientIp(req) : null },
    });
  } catch { /* logging must never break the request it is describing */ }
}

// --- lockout -----------------------------------------------------------------
// Slows down guessing without letting anyone lock a real person out for long.
export const LOCK_AFTER = 8;
export const LOCK_MINUTES = 15;

export function isLocked(editor) {
  return editor?.locked_until && new Date(editor.locked_until) > new Date();
}

export async function noteFailure(editor) {
  const failed = (editor.failed_logins ?? 0) + 1;
  const body = { failed_logins: failed };
  if (failed >= LOCK_AFTER) {
    body.locked_until = new Date(Date.now() + LOCK_MINUTES * 60000).toISOString();
    body.failed_logins = 0;
  }
  await db(`editors?id=eq.${editor.id}`, { method: 'PATCH', body });
}

export async function noteSuccess(editorId) {
  await db(`editors?id=eq.${editorId}`, {
    method: 'PATCH',
    body: { failed_logins: 0, locked_until: null, last_login_at: new Date().toISOString() },
  });
}
