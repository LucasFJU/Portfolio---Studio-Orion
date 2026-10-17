import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'public/images/optimized');
const cache = path.join(root, '.cache/image-originals');
const storage = 'https://wuyspclsfofxxrbklgze.supabase.co/storage/v1/object/public/projects/migration-4aa65750cbeb47978e49b75e68eb5811';
const remoteSources = ['cafe', 'fit', 'nex', 'noir'].map(name => `${storage}/${name}/cover.jpg`);

async function listImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const lists = await Promise.all(entries.map(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? listImages(file) : /\.(png|jpe?g|webp)$/i.test(entry.name) ? [file] : [];
  }));
  return lists.flat().sort();
}

await mkdir(output, { recursive: true });
await mkdir(cache, { recursive: true });
const sources = (await listImages(path.join(root, 'src/assets'))).map(file => ({
  key: path.relative(path.join(root, 'src'), file).replaceAll('\\', '/'),
  file,
}));
for (const url of remoteSources) {
  const file = path.join(cache, `${createHash('sha256').update(url).digest('hex')}.jpg`);
  try { await stat(file); } catch {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Image source returned ${response.status}: ${url}`);
    await writeFile(file, new Uint8Array(await response.arrayBuffer()));
  }
  sources.push({ key: url, file });
}

const manifest = {};
let originalBytes = 0;
let optimizedBytes = 0;
for (const { key, file } of sources) {
  const bytes = await readFile(file);
  const metadata = await sharp(bytes).metadata();
  const sourceWidth = metadata.autoOrient?.width ?? metadata.width;
  const sourceHeight = metadata.autoOrient?.height ?? metadata.height;
  const maxWidth = Math.min(sourceWidth, 1600);
  const widths = [...new Set([480, 768, 1200, maxWidth].filter(width => width <= maxWidth))].sort((a, b) => a - b);
  const hash = createHash('sha256').update(bytes).update('webp-v1-q84').digest('hex').slice(0, 12);
  const stem = path.basename(file, path.extname(file)).replace(/[^a-z0-9-]/gi, '-').slice(0, 45);
  const variants = [];
  for (const width of widths) {
    const filename = `${stem}-${hash}-${width}.webp`;
    const target = path.join(output, filename);
    try { await stat(target); } catch {
      await sharp(bytes).rotate().resize({ width, withoutEnlargement: true })
        .webp({ quality: 84, alphaQuality: 100, effort: 6 }).toFile(target);
    }
    variants.push({ src: `/images/optimized/${filename}`, width, bytes: (await stat(target)).size });
  }
  manifest[key] = { width: sourceWidth, height: sourceHeight, originalBytes: bytes.length, variants };
  originalBytes += bytes.length;
  optimizedBytes += variants.at(-1).bytes;
  console.log(`${key}: ${Math.round(bytes.length / 1024)} → ${Math.round(variants.at(-1).bytes / 1024)} KiB`);
}
await writeFile(path.join(root, 'src/config/image-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Largest variants: ${Math.round(originalBytes / 1024)} → ${Math.round(optimizedBytes / 1024)} KiB (${Math.round((1 - optimizedBytes / originalBytes) * 100)}% smaller)`);
