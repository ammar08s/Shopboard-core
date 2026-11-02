import type { Product } from '../../products/types.ts';
import { changeCartQuantity } from './changeCartQuantity.ts';

// restoreCartItems removes invalid quantities and unavailable products from serialized cart data.
export function restoreCartItems(saved: string | null | undefined, catalog: Product[]) {
  try {
    const data = JSON.parse(saved);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    return Object.entries(data).reduce((cart, [id, quantity]) => changeCartQuantity(cart, id, quantity as number, catalog), {});
  } catch { return {}; }
}
