import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

/**
 * Content-addressed asset URLs.
 *
 * Everything under /img and og.jpg is served with a one-year immutable cache
 * header. At a fixed filename that is a trap: replace the logo, redeploy, and
 * every returning visitor keeps the old one for a year. Hashing the contents
 * into the filename makes each change a new URL, so the immutable header
 * becomes correct instead of dangerous.
 *
 * Files are hashed once at build start; `asset('/img/logo.png')` returns
 * '/img/logo.4f2a91c8.png', and build.mjs writes the file under that name.
 */
const SRC = 'static';
const HASHED = /^\/(img\/.+|og\.jpg)$/;

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

const map = new Map();
for (const file of walk(SRC)) {
  const url = '/' + relative(SRC, file).split(/[\\/]/).join('/');
  if (!HASHED.test(url) || url.endsWith('manifest.json')) {
    map.set(url, url);
    continue;
  }
  const hash = createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 8);
  const dot = url.lastIndexOf('.');
  map.set(url, `${url.slice(0, dot)}.${hash}${url.slice(dot)}`);
}

/** Hashed public URL for a source path such as '/img/logo-light.png'. */
export const asset = (url) => map.get(url) ?? url;

/** [sourceUrl, hashedUrl] for every static file — build.mjs uses this to copy. */
export const assetMap = () => [...map.entries()];
