import { imageTypes, maxImageBytes } from '../data.ts';
import { isProductImage } from '../logic/isProductImage.ts';

// Input: an uploaded file; output: a decoded raster data URL, or a readable validation error.
export async function readImageFile(file: File) {
  if (!file || !imageTypes.includes(file.type)) throw new Error('Choose a JPG, PNG, WebP, or GIF photo.');
  if (file.size === 0 || file.size > maxImageBytes) throw new Error('Choose a photo smaller than 1 MB.');
  // Input: promise completion callbacks; output: a file read that settles with its data URL or error.
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    // Input: a completed file read event; output: the resolved data URL.
    reader.onload = () => resolve(reader.result as string);
    // Input: a file read error event; output: a rejected promise with a useful message.
    reader.onerror = () => reject(new Error('The photo could not be read. Please choose it again.'));
    // Input: a canceled file read event; output: a rejected promise describing cancellation.
    reader.onabort = () => reject(new Error('The photo upload was canceled.'));
    reader.readAsDataURL(file);
  });
  if (!isProductImage(source)) throw new Error('This photo format is not supported.');
  const image = new Image();
  image.src = source;
  try { await image.decode(); }
  catch { throw new Error('This file could not be opened as a photo.'); }
  return source;
}
