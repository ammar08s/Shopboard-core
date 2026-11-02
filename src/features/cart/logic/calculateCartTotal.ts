import type { Product } from '../../products/types.ts';
import type { Cart } from '../types.ts';
import { getCartProducts } from './getCartProducts.ts';

// calculateCartTotal totals current product prices in cents without changing the cart.
export function calculateCartTotal(cart: Cart, catalog: Product[]) {
  const products = getCartProducts(catalog);
  return Object.entries(cart).reduce((total, [id, quantity]) => total + (products[id]?.inStock ? products[id].price * quantity : 0), 0);
}
