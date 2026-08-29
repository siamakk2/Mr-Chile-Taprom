/**
 * The CMS writes back only the fields it knows about. Any key present in a
 * content file but absent from static/admin/config.yml is silently deleted the
 * first time somebody saves that screen — which would take a business detail,
 * a schedule rule or a ticket link off the site with no error anywhere.
 *
 * This test walks the config against the real data and fails on any gap, so a
 * new field added to content can never quietly become a field the taproom can
 * delete by opening a form and pressing save.
 *
 * Run: node --test test/
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'node:path';

const yaml = loadYaml(readFileSync('static/admin/config.yml', 'utf8'));

/** Names declared for one field node, recursing into objects and lists. */
function declared(field) {
  const out = { name: field.name, children: null };
  const kids = field.fields || (field.field ? [field.field] : null);
  if (kids) out.children = kids.map(declared);
  return out;
}

/** Keys actually present in the data at this node. */
function actual(value) {
  if (Array.isArray(value)) {
    const merged = {};
    for (const v of value) if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(merged, v);
    return Array.isArray(value[0]) || typeof value[0] !== 'object' ? null : merged;
  }
  if (value && typeof value === 'object') return value;
  return null;
}

function walk(fieldNodes, data, path, missing) {
  const obj = actual(data);
  if (!obj) return;
  const names = new Set(fieldNodes.map((f) => f.name));
  for (const key of Object.keys(obj)) {
    if (!names.has(key)) {
      missing.push(`${path}.${key}`);
      continue;
    }
    const node = fieldNodes.find((f) => f.name === key);
    if (node.children) walk(node.children, obj[key], `${path}.${key}`, missing);
  }
}

test('every key in the content files is declared in the CMS config', () => {
  const missing = [];
  for (const col of yaml.collections) {
    for (const file of col.files) {
      const data = JSON.parse(readFileSync(file.file, 'utf8'));
      walk(file.fields.map(declared), data, parse(file.file).name, missing);
    }
  }
  assert.deepEqual(missing, [],
    `these keys would be deleted the first time an editor saves:\n  ${missing.join('\n  ')}`);
});

/**
 * A field declared as an English/Spanish pair must be a pair in every record.
 * Where one row holds a plain string, the CMS shows two empty boxes and
 * refuses to save the whole screen as "fields missing" — with no clue which.
 * That shipped once: 11 menu names were plain strings, and the editor reported
 * 22 missing fields and would not save at all.
 */
test('bilingual fields are pairs in every record, not sometimes plain strings', () => {
  const isPair = (v) => v && typeof v === 'object' && !Array.isArray(v) && ('en' in v || 'es' in v);

  // Shapes are gathered by logical path across the whole tree, so
  // menu[].items[].name is judged over every section rather than the first.
  const shapes = new Map();
  const note = (path, kind, where) => {
    if (!shapes.has(path)) shapes.set(path, new Map());
    if (!shapes.get(path).has(kind)) shapes.get(path).set(kind, where);
  };

  const walkNode = (node, path) => {
    if (Array.isArray(node)) {
      node.forEach((row, i) => walkNode(row, `${path}[]`, i));
      return;
    }
    if (!node || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) {
      const child = `${path}.${k}`;
      if (typeof v === 'string') note(child, 'string', v.slice(0, 30));
      else if (isPair(v)) note(child, 'pair', '');
      else walkNode(v, child);
    }
  };

  for (const col of yaml.collections) {
    for (const file of col.files) {
      const data = JSON.parse(readFileSync(file.file, 'utf8'));
      walkNode(data, parse(file.file).name);
    }
  }

  const problems = [];
  for (const [path, kinds] of shapes) {
    if (kinds.size > 1) {
      problems.push(`${path} is sometimes a pair and sometimes a plain string (e.g. "${kinds.get('string')}")`);
    }
  }

  assert.deepEqual(problems, [],
    `the editor will report these as missing fields and refuse to save:\n  ${problems.join('\n  ')}`);
});

test('technical settings are not exposed to the CMS at all', () => {
  const edited = new Set(yaml.collections.flatMap((c) => c.files.map((f) => f.file)));
  assert.ok(!edited.has('content/technical.json'),
    'analytics IDs, coordinates and the verification token must not be editable');
});

test('every file the CMS points at exists and is valid JSON', () => {
  for (const col of yaml.collections) {
    for (const file of col.files) {
      assert.doesNotThrow(() => JSON.parse(readFileSync(file.file, 'utf8')), `${file.file} unreadable`);
    }
  }
});

// --- a small YAML reader, enough for this config ----------------------------
// Avoids adding a dependency to a zero-dependency build for one test file.
function loadYaml(src) {
  const lines = src.split('\n').filter((l) => !/^\s*#/.test(l) && l.trim() !== '');
  let i = 0;
  const parseBlock = (indent) => {
    const isList = lines[i] && lines[i].search(/\S/) === indent && lines[i].trim().startsWith('- ');
    const out = isList ? [] : {};
    while (i < lines.length) {
      const line = lines[i];
      const ind = line.search(/\S/);
      if (ind < indent) break;
      if (ind > indent) { i++; continue; }
      const text = line.trim();
      if (text.startsWith('- ')) {
        const rest = text.slice(2);
        if (rest.startsWith('{')) { out.push(parseFlow(rest)); i++; }
        else if (rest.includes(': ')) {
          const item = {};
          const [k, ...v] = rest.split(': ');
          item[k.trim()] = scalar(v.join(': '));
          i++;
          const sub = parseBlock(indent + 2);
          Object.assign(item, sub);
          out.push(item);
        } else { i++; out.push(parseBlock(indent + 2)); }
      } else {
        const idx = text.indexOf(':');
        const key = text.slice(0, idx).trim();
        const val = text.slice(idx + 1).trim();
        i++;
        if (val === '') out[key] = parseBlock(nextIndent(indent));
        else if (val.startsWith('[')) out[key] = parseInlineList(val);
        else if (val.startsWith('{')) out[key] = parseFlow(val);
        else out[key] = scalar(val);
      }
    }
    return out;
  };
  const nextIndent = (indent) => (lines[i] ? Math.max(lines[i].search(/\S/), indent + 1) : indent + 2);
  const scalar = (v) => {
    const s = v.trim().replace(/^['"]|['"]$/g, '');
    if (s === 'true') return true;
    if (s === 'false') return false;
    return s;
  };
  const parseFlow = (text) => {
    // { name: x, label: y, fields: [ {...}, {...} ] }  — possibly spanning lines
    let buf = text;
    while (balance(buf) !== 0 && i + 1 < lines.length) { i++; buf += ' ' + lines[i].trim(); }
    return readObject(buf);
  };
  const parseInlineList = (text) => {
    let buf = text;
    while (balance(buf) !== 0 && i < lines.length) { buf += ' ' + lines[i].trim(); i++; }
    return readArray(buf);
  };
  const balance = (s) => [...s].reduce((n, c) => n + (c === '{' || c === '[' ? 1 : c === '}' || c === ']' ? -1 : 0), 0);

  function readObject(s) {
    const inner = s.trim().replace(/^\{|\}$/g, '');
    const obj = {};
    for (const part of splitTop(inner)) {
      const idx = part.indexOf(':');
      if (idx < 0) continue;
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      obj[k] = v.startsWith('[') ? readArray(v) : v.startsWith('{') ? readObject(v) : scalar(v);
    }
    return obj;
  }
  function readArray(s) {
    const inner = s.trim().replace(/^\[|\]$/g, '');
    return splitTop(inner).filter(Boolean).map((p) =>
      p.trim().startsWith('{') ? readObject(p) : scalar(p));
  }
  function splitTop(s) {
    const parts = []; let depth = 0, cur = '';
    for (const c of s) {
      if (c === '{' || c === '[') depth++;
      if (c === '}' || c === ']') depth--;
      if (c === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
      cur += c;
    }
    if (cur.trim()) parts.push(cur);
    return parts;
  }
  return parseBlock(0);
}
