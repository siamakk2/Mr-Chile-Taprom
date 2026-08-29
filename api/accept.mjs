/**
 * /api/accept/?t=TOKEN — the page an invited editor lands on.
 *
 *   GET   show the form, if the token is good
 *   POST  set the password, activate the account, consume the invitation
 *
 * The token is checked by hash, single-use, and time limited. A used or
 * expired one gets a plain explanation rather than a stack trace, because the
 * person reading it is a taproom manager, not a developer.
 */
import { json, readRaw, db } from './_lib.mjs';
import { hashPassword, hashToken, audit } from './_auth.mjs';

export default async function handler(req, res) {
  const token = new URL(req.url, 'https://x').searchParams.get('t')
    || (req.method === 'POST' ? await tokenFromBody(req) : null);

  if (req.method === 'GET') {
    const invite = token ? await lookup(token) : null;
    return page(res, invite ? { token, email: invite.email } : null);
  }

  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' });

  try {
    const body = JSON.parse(req._body || '{}');
    const invite = await lookup(body.token);
    if (!invite) return json(res, 400, { error: 'This invitation has expired or has already been used.' });

    const hash = await hashPassword(String(body.password || ''));

    await db(`editors?id=eq.${invite.editor_id}`, {
      method: 'PATCH',
      body: {
        password_hash: hash,
        status: 'active',
        name: String(body.name || '').trim() || invite.name || null,
      },
    });
    await db(`invites?id=eq.${invite.id}`, {
      method: 'PATCH', body: { accepted_at: new Date().toISOString() },
    });

    await audit('invite_accepted', { editorId: invite.editor_id, email: invite.email, req });
    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, e.statusCode || 500, { error: e.message });
  }
}

async function tokenFromBody(req) {
  req._body = (await readRaw(req)).toString() || '{}';
  try { return JSON.parse(req._body).token; } catch { return null; }
}

async function lookup(token) {
  if (!token) return null;
  const rows = await db(
    `invites?token_hash=eq.${hashToken(String(token))}&select=id,editor_id,expires_at,accepted_at,editors(email,name)`,
  );
  const inv = rows?.[0];
  if (!inv || inv.accepted_at) return null;
  if (new Date(inv.expires_at) < new Date()) return null;
  return { ...inv, email: inv.editors?.email, name: inv.editors?.name };
}

function page(res, invite) {
  res.statusCode = invite ? 200 : 400;
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.setHeader('x-robots-tag', 'noindex');
  res.end(`<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Set your password — Mr. Chile Taproom</title>
<style>
:root{--ink:#16100E;--ink2:#211815;--masa:#F2E9D8;--dim:#B7A992;--chile:#C1272D;
--marigold:#F0A830;--verde:#2E9E63;--line:rgba(242,233,216,.16)}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--ink);
color:var(--masa);font:400 16px/1.5 system-ui,-apple-system,sans-serif;padding:1.5rem}
.card{width:100%;max-width:23rem}
img.logo{width:190px;height:auto;display:block;margin:0 auto 1.75rem}
h1{font-size:1.15rem;margin:0 0 .35rem;text-align:center}
p.sub{margin:0 0 1.75rem;color:var(--dim);font-size:.9rem;text-align:center}
label{display:block;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;
color:var(--dim);margin:0 0 .35rem}
input{width:100%;font:inherit;padding:.85rem 1rem;margin-bottom:1rem;border-radius:10px;
border:1px solid var(--line);background:var(--ink2);color:var(--masa)}
button{width:100%;font:600 1rem system-ui;padding:.9rem;border:0;border-radius:10px;
background:var(--chile);color:#fff;cursor:pointer}
.err{background:rgba(193,39,45,.15);border:1px solid var(--chile);border-radius:10px;
padding:.75rem 1rem;margin-bottom:1rem;font-size:.9rem}
.hint{color:var(--dim);font-size:.8rem;margin:-.5rem 0 1.25rem}
.done{text-align:center}
.done a{color:var(--marigold)}
</style></head><body>
<div class="card">
<img class="logo" src="/admin/logo.png" alt="Mr. Chile Taproom">
${!invite ? `
<h1>This link no longer works</h1>
<p class="sub">Invitations expire after seven days and can only be used once.
Ask for a new one.</p>` : `
<h1>Set your password</h1>
<p class="sub">${escapeHtml(invite.email)}</p>
<div id="err" class="err" style="display:none"></div>
<div id="form">
<label for="name">Your name</label>
<input id="name" type="text" autocomplete="name">
<label for="pw">Choose a password</label>
<input id="pw" type="password" autocomplete="new-password">
<p class="hint">At least 10 characters. A short phrase you will remember beats a clever short one.</p>
<label for="pw2">Type it again</label>
<input id="pw2" type="password" autocomplete="new-password">
<button id="go">Set password</button>
</div>
<div id="done" class="done" style="display:none">
<p>Your password is set.</p>
<p><a href="/admin/">Open the site editor</a></p>
</div>`}
</div>
${invite ? `<script>
(function(){
  var token = ${JSON.stringify(invite.token)};
  var err = document.getElementById('err'), btn = document.getElementById('go');
  function show(m){ err.textContent = m; err.style.display='block'; }
  btn.addEventListener('click', function(){
    var pw = document.getElementById('pw').value, pw2 = document.getElementById('pw2').value;
    if (pw.length < 10) return show('Use at least 10 characters.');
    if (pw !== pw2) return show('The two passwords do not match.');
    btn.disabled = true; btn.textContent = 'Saving…';
    fetch('/api/accept/', { method:'POST', headers:{'content-type':'application/json'},
      body: JSON.stringify({ token: token, password: pw, name: document.getElementById('name').value })
    }).then(function(r){ return r.json().then(function(d){ return {ok:r.ok,d:d}; }); })
      .then(function(res){
        if(!res.ok){ show(res.d.error||'Could not save.'); btn.disabled=false; btn.textContent='Set password'; return; }
        document.getElementById('form').style.display='none';
        document.getElementById('done').style.display='block';
      }).catch(function(){ show('Network problem.'); btn.disabled=false; btn.textContent='Set password'; });
  });
})();
<\/script>` : ''}
</body></html>`);
}

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
