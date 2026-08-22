/**
 * Image bootstrap.
 *
 * Images live in git, so on a normal git-triggered deploy this script finds
 * static/img/manifest.json already present and exits immediately. It only does
 * work for a direct file-upload deploy, where binary assets are not part of the
 * payload — then it pulls them from the repository over HTTPS so the build
 * produces an identical site either way.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RAW = process.env.ASSET_BASE
  || 'https://raw.githubusercontent.com/siamakk2/Mr-Chile-Taprom/main';
const IMG = 'static/img';

if (existsSync(join(IMG, 'manifest.json'))) {
  console.log('  assets present, skipping fetch');
  process.exit(0);
}

const get = async (path) => {
  const r = await fetch(`${RAW}/${path}`);
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  return Buffer.from(await r.arrayBuffer());
};

mkdirSync(IMG, { recursive: true });
const manifest = await get(`${IMG}/manifest.json`);
writeFileSync(join(IMG, 'manifest.json'), manifest);

const files = ['logo.png', 'logo-light.png', 'mark-light.png'];
for (const [name, m] of Object.entries(JSON.parse(manifest.toString()))) {
  if (name.startsWith('flyer-')) files.push(`${name}.jpg`, `${name}.webp`);
  else for (const w of m.widths) files.push(`${name}-${w}.jpg`, `${name}-${w}.webp`);
}

await Promise.all(files.map(async (f) => {
  writeFileSync(join(IMG, f), await get(`${IMG}/${f}`));
}));
if (!existsSync('static/og.jpg')) writeFileSync('static/og.jpg', await get('static/og.jpg'));
console.log(`  fetched ${files.length + 1} assets from ${RAW}`);
