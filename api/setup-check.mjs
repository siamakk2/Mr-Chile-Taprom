/**
 * GET /api/setup-check/
 *
 * Reports whether the editor's plumbing is configured, one line per piece, so
 * a misconfiguration is a readable sentence instead of a failed login with no
 * explanation.
 *
 * It never returns a secret — only whether each one is present and whether it
 * works. The repository list is the App's own installation scope, which is not
 * sensitive, and this is deliberately readable without a login because it
 * exists precisely for the moment before logins work.
 */
import { json } from './_lib.mjs';
import { reachableRepos } from './_github.mjs';

export default async function handler(req, res) {
  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok, detail });

  const present = (k) => Boolean(process.env[k]);

  const url = (process.env.SUPABASE_URL || '').trim();
  const looksRight = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url);
  add('SUPABASE_URL', looksRight,
    !url ? 'missing'
      : looksRight ? url
      : `${url}  <-- should be exactly https://<project-ref>.supabase.co with nothing after it`);
  const k = process.env.SUPABASE_SERVICE_KEY || '';
  add('SUPABASE_SERVICE_KEY', Boolean(k),
    !k ? 'missing'
      : k.startsWith('sb_secret_') ? 'set (new-style secret key)'
      : k.startsWith('sb_publishable_') ? 'WRONG KEY — this is the publishable key; use the secret key'
      : k.startsWith('eyJ') ? 'set (legacy service_role key)'
      : 'set (unrecognised format)');
  add('SESSION_SECRET', present('SESSION_SECRET'), present('SESSION_SECRET') ? 'set' : 'missing');
  add('GITHUB_APP_ID', present('GITHUB_APP_ID'), process.env.GITHUB_APP_ID || 'missing');
  add('GITHUB_APP_PRIVATE_KEY', present('GITHUB_APP_PRIVATE_KEY'),
    present('GITHUB_APP_PRIVATE_KEY') ? 'set' : 'missing');

  // The real test: can we actually mint a token and see the repository?
  try {
    const { repos } = await reachableRepos();
    add('GitHub App installed', true, repos.length ? repos.join(', ') : 'installed but no repositories selected');
    add('Can reach the site repo', repos.includes('siamakk2/Mr-Chile-Taprom'),
      repos.includes('siamakk2/Mr-Chile-Taprom')
        ? 'yes — contents are writable'
        : 'no — open Install App and add Mr-Chile-Taprom to the selected repositories');
  } catch (e) {
    add('GitHub App installed', false, e.message);
  }

  // And whether the database is reachable.
  try {
    if (!present('SUPABASE_URL') || !present('SUPABASE_SERVICE_KEY')) throw new Error('not configured');
    const { db } = await import('./_lib.mjs');
    const sites = await db('sites?select=slug,name');
    add('Database', true, `${sites.length} site(s): ${sites.map((s) => s.slug).join(', ')}`);
  } catch (e) {
    const base = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
    add('Database', false, `${e.message} — tried ${base}/rest/v1/sites?select=slug,name`);
  }

  const ready = checks.every((c) => c.ok);
  return json(res, 200, {
    ready,
    summary: ready ? 'Everything is configured.' : 'Some pieces are missing — see below.',
    checks,
  });
}
