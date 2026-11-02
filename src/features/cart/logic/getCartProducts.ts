import { demoCartProducts } from '../data.ts';
import type { Product } from '../../products/types.ts';
import type { CartProducts } from '../types.ts';

// getCartProducts derives current names, cent prices, and availability from a product catalog.
export function getCartProducts(catalog: Product[]): CartProducts {
  return {
    ...demoCartProducts,
    ...Object.fromEntries(catalog.map((product) => [product.id, { ...product, price: Math.round(product.price * 100) }])),
  };
}
