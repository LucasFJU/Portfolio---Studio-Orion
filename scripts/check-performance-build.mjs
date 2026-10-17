import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
const entries = Object.entries(manifest).filter(([, chunk]) => chunk.isEntry);
const initial = new Set();
function visit(key) {
  if (initial.has(key)) return;
  initial.add(key);
  for (const dependency of manifest[key].imports ?? []) visit(dependency);
}
for (const [key] of entries) visit(key);
let raw = 0;
let gzip = 0;
for (const key of initial) {
  assert(!/src\/pages\/(Admin|ProposalView)/.test(key), `Internal route eagerly loaded: ${key}`);
  const data = await readFile(`dist/${manifest[key].file}`);
  raw += data.length;
  gzip += gzipSync(data).length;
}
for (const page of ['AdminDashboard', 'AdminProjectForm', 'AdminHeroEditor', 'AdminProposalForm', 'ProposalView']) {
  assert(manifest[`src/pages/${page}.tsx`]?.isDynamicEntry, `${page} must remain a dynamic route`);
}
const html = await readFile('dist/index.html', 'utf8');
assert(!html.includes('fonts.googleapis.com'));
assert.match(html, /rel="preload"[^>]+\.woff2/);
const images = JSON.parse(await readFile('src/config/image-manifest.json', 'utf8'));
for (const image of Object.values(images)) {
  for (const variant of image.variants) assert((await stat(`dist${variant.src}`)).size === variant.bytes);
}
console.log(JSON.stringify({ initialJsBytes: raw, initialJsGzipBytes: gzip, previousInitialJsBytes: 1309754, reductionPercent: Math.round((1 - raw / 1309754) * 100), optimizedSources: Object.keys(images).length, dynamicPages: Object.values(manifest).filter(chunk => chunk.isDynamicEntry).length }, null, 2));
