import type { Product } from '../../products/types.ts';
import type { Cart } from '../types.ts';
import { getCartProducts } from './getCartProducts.ts';

// Input: quantities and current catalog; output: the available-product total in cents without mutations.
export function calculateCartTotal(cart: Cart, catalog: Product[]) {
  const products = getCartProducts(catalog);
  // Input: running total and a cart entry; output: total cents including this available product.
  return Object.entries(cart).reduce((total, [id, quantity]) => total + (products[id]?.inStock ? products[id].price * quantity : 0), 0);
}
