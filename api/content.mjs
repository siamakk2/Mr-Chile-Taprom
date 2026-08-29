/**
 * PATCH /api/content/  { file, path, value }
 *
 * Writes exactly one value into one content file and commits it. This is what
 * on-site editing posts to when somebody clicks a price on the menu page and
 * types a new one.
 *
 * Narrow on purpose. It cannot create files, delete keys, change a value's
 * type, or reach outside /content. An endpoint that edits the site's content
 * is worth keeping boring.
 */
import { json, readRaw, fail } from './_lib.mjs';
import { installationToken } from './_github.mjs';
import { currentEditor, sitesFor, audit } from './_auth.mjs';

// Only these files, and only these roots inside them.
const ALLOWED = {
  'menu.json': ['menu', 'pricesConfirmed'],
  'hours.json': ['hours', 'happyHour'],
  'events.json': ['series', 'datedEvents'],
  'private-events.json': ['privatePackages'],
  'amenities.json': ['amenities'],
  'faq.json': ['faqs'],
  'business.json': ['name', 'altName', 'tagline', 'phone', 'phoneE164', 'email',
    'street', 'locality', 'region', 'postal', 'crossStreet', 'county', 'priceRange', 'profiles'],
};

const MAX_VALUE = 2000;

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return json(res, 405, { error: 'method not allowed' });

  try {
    const me = await currentEditor(req);
    if (!me) return json(res, 401, { error: 'Sign in first.' });

    const sites = await sitesFor(me.id);
    const site = sites[0];
    if (!site) return json(res, 403, { error: 'No site assigned.' });
    if (site.role === 'viewer') return json(res, 403, { error: 'Viewers cannot make changes.' });

    const body = JSON.parse((await readRaw(req)).toString() || '{}');
    const file = String(body.file || '');
    const path = String(body.path || '');

    if (!Object.hasOwn(ALLOWED, file)) return json(res, 400, { error: `Not an editable file: ${file}` });
    const root = path.split(/[.[]/)[0];
    if (!ALLOWED[file].includes(root)) return json(res, 400, { error: `Not an editable field: ${path}` });
    if (typeof body.value === 'string' && body.value.length > MAX_VALUE) {
      return json(res, 400, { error: 'That is too long.' });
    }

    const { token } = await installationToken();
    const repoPath = `content/${file}`;

    // Read, change one leaf, write back with the sha we read — so a concurrent
    // edit fails loudly instead of silently overwriting someone else's work.
    const current = await gh(`/repos/${site.repo}/contents/${repoPath}`, { token });
    const json0 = JSON.parse(Buffer.from(current.content, 'base64').toString('utf8'));

    const before = getPath(json0, path);
    if (before === undefined) return json(res, 400, { error: `No such field: ${path}` });
    if (typeof before !== typeof body.value) {
      return json(res, 400, {
        error: `That field holds a ${typeof before}; refusing to store a ${typeof body.value}.`,
      });
    }
    if (before === body.value) return json(res, 200, { ok: true, unchanged: true });

    setPath(json0, path, body.value);
    const updated = Buffer.from(JSON.stringify(json0, null, 2) + '\n', 'utf8').toString('base64');

    await gh(`/repos/${site.repo}/contents/${repoPath}`, {
      token, method: 'PUT',
      body: {
        message: `Edit ${file} ${path} via on-site editing`,
        content: updated,
        sha: current.sha,
        committer: { name: me.name || me.email, email: me.email },
      },
    });

    await audit('content_edit', {
      editorId: me.id, email: me.email,
      detail: `${file}:${path} — ${truncate(before)} -> ${truncate(body.value)}`, req,
    });

    return json(res, 200, { ok: true, was: before });
  } catch (e) {
    if (e.statusCode === 409) {
      return json(res, 409, { error: 'Someone else just changed this. Reload and try again.' });
    }
    return json(res, e.statusCode || 500, { error: e.message });
  }
}

const truncate = (v) => String(v).slice(0, 80);

async function gh(path, { token, method = 'GET', body } = {}) {
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
  const data = await r.json().catch(() => null);
  if (!r.ok) throw fail(data?.message || `github ${r.status}`, r.status);
  return data;
}

/** "menu[2].items[1].price" -> the value, or undefined. */
function walk(obj, path) {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let node = obj;
  for (const k of keys.slice(0, -1)) {
    if (node == null || typeof node !== 'object') return { parent: null, key: null };
    node = node[k];
  }
  return { parent: node, key: keys[keys.length - 1] };
}

function getPath(obj, path) {
  const { parent, key } = walk(obj, path);
  return parent && typeof parent === 'object' ? parent[key] : undefined;
}

function setPath(obj, path, value) {
  const { parent, key } = walk(obj, path);
  if (!parent || typeof parent !== 'object') throw fail('Bad path', 400);
  parent[key] = value;
}
