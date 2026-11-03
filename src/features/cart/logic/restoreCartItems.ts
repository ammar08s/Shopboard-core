import type { Product } from '../../products/types.ts';
import { changeCartQuantity } from './changeCartQuantity.ts';

// Input: serialized quantities and catalog; output: valid available cart items, or an empty cart for bad data.
export function restoreCartItems(saved: string | null | undefined, catalog: Product[]) {
  try {
    const data = JSON.parse(saved);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    // Input: restored quantities and one saved entry; output: the cart after validating that entry.
    return Object.entries(data).reduce((cart, [id, quantity]) => changeCartQuantity(cart, id, quantity as number, catalog), {});
  } catch { return {}; }
}
