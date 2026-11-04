import type { Product } from '../products/types.ts';
import type { Cart } from '../cart/types.ts';
import type { Notify } from '../notifications/types.ts';

export interface ProductDetailOperations {
  getProducts: () => Product[];
  refreshProducts: () => void;
  getCart: () => Cart;
  reloadCart: () => void;
  onAdd: (id: number) => string;
  bindReviews: (id: number, canReview: () => boolean) => { refresh: () => void };
  notify?: Notify;
}
