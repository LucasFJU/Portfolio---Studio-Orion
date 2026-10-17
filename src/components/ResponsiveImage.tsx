import type { ImgHTMLAttributes } from 'react';
import { getResponsiveImageProps } from '@/lib/responsive-images';

export default function ResponsiveImage({ src, sizes = '100vw', loading = 'lazy', decoding = 'async', fetchPriority, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  // React 18 forwards the native priority hint using its lowercase spelling.
  const priority = fetchPriority ? { fetchpriority: fetchPriority } : {};
  return <img {...props} {...getResponsiveImageProps(src, sizes)} {...priority} loading={loading} decoding={decoding} />;
}
