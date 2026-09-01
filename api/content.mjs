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

/**
 * Lists that may have rows added or removed, and the ceiling on each.
 *
 * Deliberately not every list. series is absent because a recurring night owns
 * a slug that appears in URLs, in the event schema and in the routing table -
 * adding one from a form would produce a page that half exists. Those still
 * go through a developer.
 */
const LISTS = {
  'menu.json':           { 'menu': 12, 'menu[].items': 40 },
  'events.json':         { 'datedEvents': 60 },
  'faq.json':            { 'faqs': 40 },
  'amenities.json':      { 'amenities': 24 },
  'private-events.json': { 'privatePackages': 12 },
};

/** Match a concrete path like menu[2].items against the patterns above. */
const listRule = (file, path) => {
  const shape = path.replace(/\[\d+\]/g, '[]');
  return LISTS[file]?.[shape];
};

/**
 * A blank row shaped like the ones already there.
 *
 * Copying the shape rather than inventing one keeps the invariant the rest of
 * the system relies on: a field that is an { en, es } pair everywhere stays a
 * pair. A row added as a plain string would show up in the editor as an empty
 * required field and block saving the whole screen - the exact bug that came
 * from mixed shapes before.
 */
function blankLike(sample) {
  if (Array.isArray(sample)) return [];
  if (sample === null) return null;
  if (typeof sample === 'boolean') return false;
  if (typeof sample === 'number') return 0;
  if (typeof sample === 'string') return '';
  if (typeof sample === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(sample)) {
      // Identifiers are left out entirely rather than blanked; an empty slug
      // is worse than an absent one.
      if (['slug', 'pageKey', 'image', 'byDay', 'byMonthWeek', 'schemaDay'].includes(k)) continue;
      out[k] = blankLike(v);
    }
    return out;
  }
  return '';
}

export default async function handler(req, res) {
  if (!['GET', 'PATCH', 'POST'].includes(req.method)) {
    return json(res, 405, { error: 'method not allowed' });
  }

  try {
    const me = await currentEditor(req);
    if (!me) return json(res, 401, { error: 'Sign in first.' });

    const sites = await sitesFor(me.id);
    const site = sites[0];
    if (!site) return json(res, 403, { error: 'No site assigned.' });
    if (site.role === 'viewer') return json(res, 403, { error: 'Viewers cannot make changes.' });

    // GET returns a whole content file so the admin can render forms from it.
    if (req.method === 'GET') {
      const want = new URL(req.url, 'https://x').searchParams.get('file') || '';
      if (!Object.hasOwn(ALLOWED, want)) return json(res, 400, { error: `Not a content file: ${want}` });
      const { token } = await installationToken();
      const file0 = await gh(`/repos/${site.repo}/contents/content/${want}`, { token });
      return json(res, 200, {
        file: want,
        role: site.role,
        data: JSON.parse(Buffer.from(file0.content, 'base64').toString('utf8')),
      });
    }

    const body = JSON.parse((await readRaw(req)).toString() || '{}');
    const file = String(body.file || '');
    const path = String(body.path || '');

    // POST handles structure: adding and removing rows.
    if (req.method === 'POST') return structure(res, site, me, body, req);

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

/** Add or remove one row in a list, keeping the shape of its siblings. */
async function structure(res, site, me, body, req) {
  const file = String(body.file || '');
  const path = String(body.path || '');
  const op = String(body.op || '');

  if (!Object.hasOwn(ALLOWED, file)) return json(res, 400, { error: `Not an editable file: ${file}` });
  const max = listRule(file, path);
  if (!max) return json(res, 400, { error: 'That list cannot be changed here.' });
  if (!['add', 'remove'].includes(op)) return json(res, 400, { error: 'Unknown operation.' });

  const { token } = await installationToken();
  const repoPath = `content/${file}`;
  const current = await gh(`/repos/${site.repo}/contents/${repoPath}`, { token });
  const doc = JSON.parse(Buffer.from(current.content, 'base64').toString('utf8'));

  const list = getPath(doc, path);
  if (!Array.isArray(list)) return json(res, 400, { error: `${path} is not a list.` });

  let detail;
  if (op === 'add') {
    if (list.length >= max) return json(res, 400, { error: `That list is limited to ${max} items.` });
    if (!list.length) return json(res, 400, { error: 'Cannot add to an empty list from here yet.' });
    list.push(blankLike(list[0]));
    detail = `added row ${list.length} to ${path}`;
  } else {
    const index = Number(body.index);
    if (!Number.isInteger(index) || index < 0 || index >= list.length) {
      return json(res, 400, { error: 'No such row.' });
    }
    if (list.length <= 1) return json(res, 400, { error: 'Cannot remove the last one.' });
    const [gone] = list.splice(index, 1);
    detail = `removed ${path}[${index}] (${truncate(labelOf(gone))})`;
  }

  await gh(`/repos/${site.repo}/contents/${repoPath}`, {
    token, method: 'PUT',
    body: {
      message: `${op === 'add' ? 'Add' : 'Remove'} item in ${file} via the site editor`,
      content: Buffer.from(JSON.stringify(doc, null, 2) + '\n', 'utf8').toString('base64'),
      sha: current.sha,
      committer: { name: me.name || me.email, email: me.email },
    },
  });

  await audit('content_structure', { editorId: me.id, email: me.email, detail: `${file}: ${detail}`, req });
  return json(res, 200, { ok: true, count: list.length });
}

const labelOf = (row) => {
  const v = row?.name ?? row?.section ?? row?.q ?? row?.date ?? '';
  return typeof v === 'object' ? (v.en ?? '') : v;
};

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
