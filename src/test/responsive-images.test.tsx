import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ResponsiveImage from '@/components/ResponsiveImage';
import portrait from '@/assets/lucas-hero-seated-v2.png';
import manifest from '@/config/image-manifest.json';
import { getResponsiveImageProps } from '@/lib/responsive-images';

afterEach(cleanup);

describe('responsive image delivery', () => {
  it('keeps unknown uploads and their access parameters intact', () => {
    const source = 'https://example.com/new-upload.png?token=keep-me';
    expect(getResponsiveImageProps(source)).toEqual({ src: source });
  });

  it('serves the same portrait with responsive WebP sources without changing layout attributes', () => {
    render(<ResponsiveImage src={portrait} alt="Retrato" width={1455} height={1081} loading="eager" fetchPriority="high" sizes="100vw" className="original-position" />);
    const img = screen.getByRole('img', { name: 'Retrato' });
    expect(img).toHaveAttribute('src', expect.stringMatching(/\/images\/optimized\/.+\.webp$/));
    expect(img).toHaveAttribute('srcset', expect.stringContaining('480w'));
    expect(img).toHaveAttribute('srcset', expect.stringContaining('1455w'));
    expect(img).toHaveAttribute('width', '1455');
    expect(img).toHaveAttribute('height', '1081');
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveClass('original-position');
  });

  it('uses known public cover copies while leaving the database URL unchanged', () => {
    const url = Object.keys(manifest).find(key => key.endsWith('/cafe/cover.jpg'))!;
    const props = getResponsiveImageProps(`${url}?cache=1`, '50vw');
    expect(props.src).toMatch(/\.webp$/);
    expect(props.srcSet).toContain('768w');
    expect(props.sizes).toBe('50vw');
  });

  it('defaults below-the-fold images to lazy loading', () => {
    render(<ResponsiveImage src={portrait} alt="Apoio" />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
  });

  it('cuts the largest reported images by at least half even at the largest output size', () => {
    const keys = ['assets/lucas-hero-seated-v2.png', ...Object.keys(manifest).filter(key => /\/(cafe|fit)\/cover.jpg$/.test(key))];
    expect(keys).toHaveLength(3);
    for (const key of keys) {
      const entry = manifest[key as keyof typeof manifest];
      expect(entry.variants[entry.variants.length - 1].bytes).toBeLessThan(entry.originalBytes / 2);
    }
  });
});
