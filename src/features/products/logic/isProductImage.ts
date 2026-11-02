import { maxImageBytes } from '../data.ts';

// isProductImage accepts local demo photos, raster uploads, and absolute HTTP or HTTPS image URLs.
export function isProductImage(source: unknown): source is string {
  if (typeof source !== 'string' || !source) return false;
  if (/^\/images\/product-(?:[1-9]|1[0-2])\.jpg$/.test(source)) return true;
  if (/^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(source)) {
    return source.length <= Math.ceil(maxImageBytes / 3) * 4 + 40;
  }
  if (source.length > 2048) return false;
  try {
    const url = new URL(source);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}
