import type { Notify } from '../notifications/types.ts';

export type Cart = Record<string, number>;
export type CartProducts = Record<string, { name: string; price: number; inStock: boolean }>;

export interface CartOperations {
  notify?: Notify;
  getCart: () => Cart;
  getCartProducts: () => CartProducts;
  cartTotal: () => number;
  onAdd: (id: string | number) => string;
  onQuantityChange: (id: string | number, quantity: number) => string;
  onClear: () => string;
}
