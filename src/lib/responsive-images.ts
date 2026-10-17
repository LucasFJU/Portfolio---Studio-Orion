import imageManifest from '@/config/image-manifest.json';

interface ImageEntry {
  width: number;
  height: number;
  originalBytes: number;
  variants: { src: string; width: number; bytes: number }[];
}

const localAssets = import.meta.glob<string>('../assets/**/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const entries = imageManifest as Record<string, ImageEntry>;
const bySource = new Map<string, ImageEntry>();
for (const [key, entry] of Object.entries(entries)) {
  const source = key.startsWith('assets/') ? localAssets[`../${key}`] : key;
  if (source) bySource.set(source, entry);
}

/** Known copies only: new uploads and custom URLs continue to use their original. */
export function getResponsiveImageProps(src: string | undefined, sizes = '100vw') {
  const entry = src ? bySource.get(src.split(/[?#]/)[0]) : undefined;
  if (!entry) return { src };
  return {
    src: entry.variants[entry.variants.length - 1].src,
    srcSet: entry.variants.map(variant => `${variant.src} ${variant.width}w`).join(', '),
    sizes,
  };
}
