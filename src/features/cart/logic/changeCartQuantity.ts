import { maxCartQuantity } from '../data.ts';
import type { Product } from '../../products/types.ts';
import type { Cart } from '../types.ts';
import { getCartProducts } from './getCartProducts.ts';

// changeCartQuantity returns a new cart for valid quantities and available products.
export function changeCartQuantity(cart: Cart, id: string | number, quantity: number, catalog: Product[]) {
  const products = getCartProducts(catalog);
  if (!Object.hasOwn(products, id) || !Number.isInteger(quantity) || quantity < 0 || quantity > maxCartQuantity) return cart;
  const next = { ...cart };
  if (quantity === 0) delete next[id];
  else if (products[id].inStock) next[id] = quantity;
  return next;
}
