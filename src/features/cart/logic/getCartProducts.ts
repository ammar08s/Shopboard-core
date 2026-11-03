import { demoCartProducts } from '../data.ts';
import type { Product } from '../../products/types.ts';
import type { CartProducts } from '../types.ts';

// Input: a current product catalog; output: cart products keyed by ID with integer cent prices.
export function getCartProducts(catalog: Product[]): CartProducts {
  return {
    ...demoCartProducts,
    // Input: a product priced in dollars; output: its keyed cart record priced in cents.
    ...Object.fromEntries(catalog.map((product) => [product.id, { ...product, price: Math.round(product.price * 100) }])),
  };
}
