/**
 * Checks on the content files themselves.
 *
 * These used to be checks against a third-party CMS config. That CMS is gone —
 * it could not authenticate our editors — so the config went with it, and the
 * "is every field declared" test went too: our own admin renders whatever the
 * data contains, so a field can no longer be silently dropped by not being
 * declared. That whole class of bug is designed out rather than tested for.
 *
 * What remains is the check that mattered.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, parse } from 'node:path';

const DIR = 'content';
const files = readdirSync(DIR).filter((f) => f.endsWith('.json'));

test('every content file is valid JSON', () => {
  for (const f of files) {
    assert.doesNotThrow(() => JSON.parse(readFileSync(join(DIR, f), 'utf8')), `${f} is not valid JSON`);
  }
});

/**
 * A field holding { en, es } in one record must hold a pair in all of them.
 *
 * Mixed shapes break the editor: a plain string where a pair is expected shows
 * as two empty required boxes and blocks saving the whole screen. That shipped
 * once — eleven menu names were plain strings and the editor reported
 * twenty-two missing fields with no clue which.
 */
test('bilingual fields are pairs in every record', () => {
  const isPair = (v) => v && typeof v === 'object' && !Array.isArray(v) && ('en' in v || 'es' in v);
  const shapes = new Map();

  const note = (path, kind, sample) => {
    if (!shapes.has(path)) shapes.set(path, new Map());
    if (!shapes.get(path).has(kind)) shapes.get(path).set(kind, sample);
  };

  const walk = (node, path) => {
    if (Array.isArray(node)) { node.forEach((row) => walk(row, `${path}[]`)); return; }
    if (!node || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) {
      const child = `${path}.${k}`;
      if (typeof v === 'string') note(child, 'string', v.slice(0, 30));
      else if (isPair(v)) note(child, 'pair', '');
      else walk(v, child);
    }
  };

  for (const f of files) walk(JSON.parse(readFileSync(join(DIR, f), 'utf8')), parse(f).name);

  const problems = [];
  for (const [path, kinds] of shapes) {
    if (kinds.size > 1) problems.push(`${path} is sometimes a pair and sometimes a plain string (e.g. "${kinds.get('string')}")`);
  }
  assert.deepEqual(problems, [],
    `the editor will show these as empty required fields:\n  ${problems.join('\n  ')}`);
});

test('technical settings stay out of the editable content files', () => {
  const editable = files.filter((f) => f !== 'technical.json');
  const secrets = ['ga4Id', 'googleSiteVerification', 'origin', 'lat', 'lng'];
  for (const f of editable) {
    const data = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    for (const s of secrets) {
      assert.ok(!Object.hasOwn(data, s), `${s} must live in technical.json, not ${f}`);
    }
  }
});
