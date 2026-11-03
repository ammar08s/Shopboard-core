import type { ProductValues } from '../types.ts';
import { isProductImage } from './isProductImage.ts';

// Input: proposed product values; output: no value when valid, or an actionable validation error.
export function validateProduct(product: ProductValues) {
  if (!product || typeof product.name !== 'string' || !product.name.trim() || product.name.trim().length > 100) {
    throw new Error('Enter a product name between 1 and 100 characters.');
  }
  if (typeof product.category !== 'string' || !product.category.trim() || product.category.trim().length > 60) {
    throw new Error('Enter a category between 1 and 60 characters.');
  }
  if (typeof product.price !== 'number' || !Number.isFinite(product.price) || product.price < 0 || product.price > 1000000 || Math.abs(product.price * 100 - Math.round(product.price * 100)) > 0.000001) {
    throw new Error('Enter a price from $0 to $1,000,000 with at most two decimal places.');
  }
  if (!isProductImage(product.image)) {
    throw new Error('Choose a supported photo or enter a valid HTTP or HTTPS image URL.');
  }
  if (typeof product.inStock !== 'boolean') throw new Error('Choose a stock status.');
}
