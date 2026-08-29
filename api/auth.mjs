/**
 * GET  /api/auth/  — the login screen, opened by the CMS in a popup
 * POST /api/auth/  — email and password; on success, hand the CMS a token
 *
 * The CMS expects an OAuth popup. It gets our own login form instead, which is
 * why editors never see GitHub: the server holds the App key and mints a
 * one-hour installation token only after a password check passes.
 *
 * That token is scoped to contents-write on one repository and expires within
 * the hour, so the worst case for a leaked browser session is bounded.
 */
import { json, readRaw, ORIGIN } from './_lib.mjs';
import { installationToken } from './_github.mjs';
import {
  verifyPassword, createSession, sessionCookie, currentEditor, sitesFor,
  audit, isLocked, noteFailure, noteSuccess, LOCK_MINUTES,
} from './_auth.mjs';
import { db } from './_lib.mjs';

export default async function handler(req, res) {
  if (req.method === 'GET') return loginPage(res, null, await alreadyIn(req));
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' });

  let email = '', password = '';
  try {
    const body = JSON.parse((await readRaw(req)).toString() || '{}');
    email = String(body.email || '').trim().toLowerCase();
    password = String(body.password || '');
  } catch { /* handled below */ }

  if (!email || !password) return json(res, 400, { error: 'Email and password are required.' });

  try {
    const rows = await db(`editors?email=eq.${encodeURIComponent(email)}&select=*`);
    const editor = rows?.[0];

    // The same message and the same work either way, so this cannot be used to
    // discover which email addresses have accounts.
    if (!editor || editor.status !== 'active') {
      await verifyPassword(password, 'scrypt$16384$8$1$AAAA$AAAA').catch(() => {});
      await audit('login_failed', { email, detail: 'no such active account', req });
      return json(res, 401, { error: 'Email or password is not right.' });
    }

    if (isLocked(editor)) {
      await audit('login_blocked', { editorId: editor.id, email, detail: 'locked', req });
      return json(res, 429, { error: `Too many attempts. Try again in ${LOCK_MINUTES} minutes.` });
    }

    if (!(await verifyPassword(password, editor.password_hash))) {
      await noteFailure(editor);
      await audit('login_failed', { editorId: editor.id, email, detail: 'bad password', req });
      return json(res, 401, { error: 'Email or password is not right.' });
    }

    const sites = await sitesFor(editor.id);
    if (!sites.length) {
      await audit('login_failed', { editorId: editor.id, email, detail: 'no sites assigned', req });
      return json(res, 403, { error: 'This account is not assigned to a site yet.' });
    }

    await noteSuccess(editor.id);
    const { token: sessionToken, expires } = await createSession(editor.id, req);
    const { token: ghToken } = await installationToken();
    await audit('login', { editorId: editor.id, email, detail: sites.map((s) => s.slug).join(','), req });

    res.setHeader('set-cookie', sessionCookie(sessionToken, expires));
    return json(res, 200, { ok: true, name: editor.name || editor.email, token: ghToken });
  } catch (e) {
    await audit('login_error', { email, detail: e.message, req });
    return json(res, e.statusCode || 500, { error: e.message });
  }
}

/** If they already have a valid session, skip straight to handing over a token. */
async function alreadyIn(req) {
  try {
    const editor = await currentEditor(req);
    if (!editor) return null;
    const sites = await sitesFor(editor.id);
    if (!sites.length) return null;
    const { token } = await installationToken();
    return { name: editor.name || editor.email, token };
  } catch { return null; }
}

function loginPage(res, error, session) {
  const origin = ORIGIN();
  res.statusCode = 200;
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.setHeader('x-robots-tag', 'noindex');
  res.end(`<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Sign in — Mr. Chile Taproom</title>
<style>
:root{--ink:#16100E;--ink2:#211815;--masa:#F2E9D8;--dim:#B7A992;
--chile:#C1272D;--marigold:#F0A830;--line:rgba(242,233,216,.16)}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--ink);
color:var(--masa);font:400 16px/1.5 system-ui,-apple-system,sans-serif;padding:1.5rem}
.card{width:100%;max-width:22rem}
img.logo{width:190px;height:auto;display:block;margin:0 auto 1.75rem}
h1{font-size:1.15rem;margin:0 0 .35rem;text-align:center}
p.sub{margin:0 0 1.75rem;color:var(--dim);font-size:.9rem;text-align:center}
label{display:block;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;
color:var(--dim);margin:0 0 .35rem}
input{width:100%;font:inherit;padding:.85rem 1rem;margin-bottom:1rem;border-radius:10px;
border:1px solid var(--line);background:var(--ink2);color:var(--masa)}
input:focus{outline:2px solid var(--marigold);outline-offset:1px}
button{width:100%;font:600 1rem system-ui;padding:.9rem;border:0;border-radius:10px;
background:var(--chile);color:#fff;cursor:pointer}
button:disabled{opacity:.6;cursor:default}
.err{background:rgba(193,39,45,.15);border:1px solid var(--chile);border-radius:10px;
padding:.75rem 1rem;margin-bottom:1rem;font-size:.9rem}
.ok{text-align:center;color:var(--dim)}
.foot{margin-top:1.5rem;text-align:center;font-size:.8rem;color:var(--dim)}
</style></head><body>
<div class="card">
<img class="logo" src="/admin/logo.png" alt="Mr. Chile Taproom">
${session ? `<p class="ok">Signed in as ${escapeHtml(session.name)}.<br>Opening the editor…</p>` : `
<h1>Sign in to edit the site</h1>
<p class="sub">Mr. Chile Taproom</p>
<div id="err" class="err" style="display:none"></div>
<label for="email">Email</label>
<input id="email" type="email" autocomplete="username" autocapitalize="off" autofocus>
<label for="password">Password</label>
<input id="password" type="password" autocomplete="current-password">
<button id="go">Sign in</button>
<p class="foot">Trouble signing in? Contact Siamak.</p>`}
</div>
<script>
(function(){
  var ORIGIN = ${JSON.stringify(origin)};
  var existing = ${session ? JSON.stringify(session.token) : 'null'};

  function handOver(token){
    var msg = 'authorization:github:success:' + JSON.stringify({ token: token, provider: 'github' });
    function reply(e){
      if (e.data !== 'authorizing:github') return;
      window.removeEventListener('message', reply, false);
      window.opener.postMessage(msg, ORIGIN);
    }
    window.addEventListener('message', reply, false);
    if (window.opener) window.opener.postMessage('authorizing:github', ORIGIN);
  }

  if (existing) { handOver(existing); return; }

  var btn = document.getElementById('go');
  var err = document.getElementById('err');
  function show(m){ err.textContent = m; err.style.display = 'block'; }

  function submit(){
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    if (!email || !password) return show('Enter your email and password.');
    btn.disabled = true; btn.textContent = 'Signing in…';
    fetch('/api/auth/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    }).then(function(r){ return r.json().then(function(d){ return { ok: r.ok, d: d }; }); })
      .then(function(res){
        if (!res.ok) { show(res.d.error || 'Could not sign in.'); btn.disabled = false; btn.textContent = 'Sign in'; return; }
        btn.textContent = 'Opening the editor…';
        handOver(res.d.token);
      }).catch(function(){
        show('Network problem. Try again.'); btn.disabled = false; btn.textContent = 'Sign in';
      });
  }

  btn.addEventListener('click', submit);
  document.getElementById('password').addEventListener('keydown', function(e){ if (e.key === 'Enter') submit(); });
  document.getElementById('email').addEventListener('keydown', function(e){ if (e.key === 'Enter') submit(); });
})();
<\/script></body></html>`);
}

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
