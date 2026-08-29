/**
 * GitHub App access.
 *
 * The point of using an App rather than a personal token: after an editor
 * signs in with their email, the server mints an installation token scoped to
 * contents-write on one repository, valid for one hour. That token is what the
 * browser gets. A leaked one can edit one repo's content until it expires,
 * which is a survivable afternoon rather than a compromised account.
 *
 * The private key never leaves the server. JWTs are signed with node:crypto,
 * so this stays dependency-free.
 */
import { createSign, createHash } from 'node:crypto';

const b64url = (buf) => Buffer.from(buf).toString('base64url');

/** Normalise a key pasted into an environment variable. */
function privateKey() {
  const raw = process.env.GITHUB_APP_PRIVATE_KEY;
  if (!raw) throw fail('GITHUB_APP_PRIVATE_KEY is not set', 503);
  // Some dashboards collapse newlines into the literal characters \n.
  const key = raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;
  if (!key.includes('BEGIN') || !key.includes('PRIVATE KEY')) {
    throw fail('GITHUB_APP_PRIVATE_KEY does not look like a PEM key — paste the whole file including the BEGIN and END lines', 503);
  }
  return key.trim() + '\n';
}

const fail = (message, statusCode = 500) => Object.assign(new Error(message), { statusCode });

/** A short-lived JWT proving we are the App itself. */
function appJwt() {
  const appId = process.env.GITHUB_APP_ID;
  if (!appId) throw fail('GITHUB_APP_ID is not set', 503);

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  // Backdated by a minute to tolerate clock skew; GitHub rejects future-dated.
  const payload = b64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId }));
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  return `${header}.${payload}.${signer.sign(privateKey(), 'base64url')}`;
}

async function gh(path, { method = 'GET', token, body } = {}) {
  const r = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'mr-chile-site-editor',
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) throw fail(data?.message || `github ${r.status} on ${path}`, r.status === 404 ? 404 : 502);
  return data;
}

/**
 * Find where the App is installed. Looked up rather than configured, so nobody
 * has to hunt for an installation ID in a URL.
 */
export async function installationId() {
  const list = await gh('/app/installations', { token: appJwt() });
  if (!list?.length) throw fail('The GitHub App is not installed on any account yet — open the App and click Install App', 503);
  return list[0].id;
}

/** A one-hour token scoped to the repositories the App can reach. */
export async function installationToken() {
  const id = await installationId();
  const res = await gh(`/app/installations/${id}/access_tokens`, { method: 'POST', token: appJwt() });
  return { token: res.token, expiresAt: res.expires_at, permissions: res.permissions };
}

/** What the App can actually see — used by the setup check. */
export async function reachableRepos() {
  const { token } = await installationToken();
  const res = await gh('/installation/repositories', { token });
  return { repos: (res?.repositories ?? []).map((r) => r.full_name), token };
}

export { fail };
