/**
 * GitHub OAuth for the CMS at /admin.
 *
 * The CMS is a static page in the browser, so it cannot hold a GitHub client
 * secret. This endpoint does the secret half of the handshake: the browser is
 * sent to GitHub, GitHub returns a code here, and this exchanges that code for
 * a token and hands it back to the CMS window.
 *
 * Editors sign in with their own GitHub account, so every change on the site is
 * attributed to a person in the commit history. Access is granted by adding
 * them as a collaborator on the repository and removed by taking that away —
 * there is no separate password to rotate when someone leaves.
 *
 *   GET /api/auth            -> redirect to GitHub
 *   GET /api/auth?code=...   -> exchange and hand the token back
 */
import { randomBytes } from 'node:crypto';

const SCOPE = 'repo';

export default async function handler(req, res) {
  const url = new URL(req.url, 'https://x');
  const code = url.searchParams.get('code');
  const origin = process.env.SITE_ORIGIN || 'https://www.mrchiletaproom.com';

  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    res.statusCode = 503;
    res.setHeader('content-type', 'text/plain');
    return res.end('The site editor is not configured yet: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are missing.');
  }

  // Step 1 — no code yet, so send them to GitHub.
  if (!code) {
    const state = randomBytes(16).toString('hex');
    const to = new URL('https://github.com/login/oauth/authorize');
    to.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID);
    to.searchParams.set('scope', SCOPE);
    to.searchParams.set('state', state);
    to.searchParams.set('redirect_uri', `${origin}/api/auth`);
    res.statusCode = 302;
    res.setHeader('cache-control', 'no-store');
    res.setHeader('set-cookie', `cms_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
    res.setHeader('location', to.toString());
    return res.end();
  }

  // Step 2 — GitHub sent us back. Check state, then trade the code for a token.
  const cookie = String(req.headers.cookie || '');
  const expected = /(?:^|;\s*)cms_state=([a-f0-9]+)/.exec(cookie)?.[1];
  const state = url.searchParams.get('state');
  if (!expected || !state || state !== expected) {
    return finish(res, { error: 'Sign-in expired or was tampered with. Close this window and try again.' }, origin);
  }

  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${origin}/api/auth`,
      }),
    });
    const data = await r.json();
    if (!data.access_token) throw new Error(data.error_description || 'GitHub declined the sign-in');
    return finish(res, { token: data.access_token, provider: 'github' }, origin);
  } catch (e) {
    return finish(res, { error: e.message }, origin);
  }
}

/**
 * Hand the result back to the CMS window that opened this one, using the
 * postMessage handshake it expects, then close.
 */
function finish(res, payload, origin) {
  const ok = !payload.error;
  const message = ok
    ? `authorization:github:success:${JSON.stringify(payload)}`
    : `authorization:github:error:${JSON.stringify(payload)}`;

  res.statusCode = ok ? 200 : 401;
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.setHeader('set-cookie', 'cms_state=; Path=/; Max-Age=0');
  res.end(`<!doctype html><meta charset="utf-8"><title>Signing in…</title>
<body style="font:400 16px system-ui;padding:2rem;background:#16100E;color:#F2E9D8">
<p>${ok ? 'Signed in. This window will close.' : escapeHtml(payload.error)}</p>
<script>
(function(){
  var msg = ${JSON.stringify(message)};
  function send(e){
    if (e.data !== 'authorizing:github') return;
    window.removeEventListener('message', send, false);
    window.opener.postMessage(msg, ${JSON.stringify(origin)});
  }
  window.addEventListener('message', send, false);
  if (window.opener) window.opener.postMessage('authorizing:github', ${JSON.stringify(origin)});
})();
<\/script></body>`);
}

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
